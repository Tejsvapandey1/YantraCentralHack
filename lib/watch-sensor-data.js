import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import prisma from "./prisma.js";


const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

/* ---------- DB WATCH STATE ---------- */
let lastRecordId = null;

/* ---------- WATCH DATABASE ---------- */
async function watchSensorData() {
  try {
    console.log("being called")
    const latest = await prisma.vulnerable_kit.findFirst({
      orderBy: { created_at: "desc" },
    });

    if (!latest) return;

    // convert bigint
    const safe = JSON.parse(
      JSON.stringify(latest, (_, v) =>
        typeof v === "bigint" ? Number(v) : v
      )
    );

    if (lastRecordId !== safe.id) {
      lastRecordId = safe.id;

      console.log("📡 NEW SENSOR DATA:", safe);

      if (global.io) {
        global.io.emit("sensor-update", safe);

        if (safe.fall_detected) {
          global.io.emit("fall-alert", safe);
          console.log("🚨 FALL DETECTED");
        }
      }
    }
  } catch (err) {
    console.error("DB Watch error:", err.message);
  }
}

/* ---------- START SERVER ---------- */
app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
  });

  // start watcher loop
  setInterval(watchSensorData, 1000);

  httpServer.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
});