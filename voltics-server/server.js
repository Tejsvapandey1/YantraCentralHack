require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

/* ---------- SUPABASE ---------- */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ---------- SOCKET ---------- */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

/* ---------- REALTIME DB ---------- */

supabase
  .channel("monitor")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "vulnerable_kit" },
    (payload) => {
      const data = payload.new;
      if (!data) return;

      // send live sensor data
      io.emit("sensor_update", data);

      // send fall alert
      if (data.fall_detected === true) {
        console.log("🚨 FALL DETECTED");
        io.emit("fall_alert", data);
      }
    }
  )
  .subscribe();

/* ---------- START ---------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Socket server running on port", PORT);
});