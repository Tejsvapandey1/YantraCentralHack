import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import pkg from "pg";

const { Client } = pkg;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

/* ---------- POSTGRES LISTENER ---------- */

const dbListener = new Client({
  connectionString: process.env.DATABASE_URL
});

await dbListener.connect();

await dbListener.query("LISTEN sensor_update");

dbListener.on("notification", (msg) => {
  const data = JSON.parse(msg.payload);

  console.log("📡 NEW SENSOR DATA:", data);

  if (global.io) {
    global.io.emit("sensor-update", data);

    if (data.fall_detected) {
      global.io.emit("fall-alert", data);
      console.log("🚨 FALL DETECTED");
    }
  }
});

/* ---------- START SERVER ---------- */

app.prepare().then(() => {
  console.log("DB:", process.env.DATABASE_URL);
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
  });

  httpServer.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
});