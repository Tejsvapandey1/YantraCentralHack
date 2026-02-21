require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());

const twilio = require("twilio");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

/* ---------- SUPABASE ---------- */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    async (payload) => {
      const data = payload.new;
      if (!data) return;

      io.emit("sensor_update", data);

      if (data.fall_detected === true) {
        const now = Date.now();

        // check cooldown
        if (now - lastAlertTime < ALERT_COOLDOWN) {
          console.log("⏳ Fall detected but cooldown active — SMS not sent");
          return;
        }

        // update last alert time
        lastAlertTime = now;

        console.log("🚨 FALL DETECTED");

        io.emit("fall_alert", data);

        try {
          await twilioClient.messages.create({
            body: `🚨 EMERGENCY ALERT!
Fall detected for patient.
Immediate attention required.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.ALERT_PHONE_NUMBER,
          });

          console.log("✅ SMS sent");
        } catch (err) {
          console.error("❌ SMS failed:", err.message);
        }
      }
    },
  )
  .subscribe();

/* ---------- START ---------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Socket server running on port", PORT);
});
