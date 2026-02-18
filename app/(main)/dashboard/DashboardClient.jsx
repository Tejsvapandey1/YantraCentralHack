"use client";

import { Metric } from "../../../components/metric";
import { Chart } from "../../../components/chart";
import { useEffect, useRef, useState } from "react";
import useFetch from "../../../hooks/use-fetch";
import { findUser } from "../../../actions/user";
import HealthChatbot from "../../../components/health-checkbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { socket } from "../../../lib/socket-client";

/* -------- HEALTH LIMITS -------- */

const LIMITS = {
  heartrate: { min: 60, max: 100 },
  spo2: { min: 95, max: 100 },
  bodytemp: { min: 36.1, max: 37.5 },
  env_pressure: { min: 980, max: 1050 },
};

function getAlerts(latest) {
  if (!latest) return [];

  const alerts = [];

  if (latest.heartrate < 60 || latest.heartrate > 100)
    alerts.push("Abnormal Heart Rate");

  if (latest.spo2 < 95) alerts.push("Low Oxygen Level");

  if (latest.bodytemp < 36.1 || latest.bodytemp > 37.5)
    alerts.push("Abnormal Body Temperature");

  if (latest.env_pressure < 980 || latest.env_pressure > 1050)
    alerts.push("Abnormal Pressure");

  return alerts;
}

/* ================= DASHBOARD ================= */

export default function DashboardClient({ data = [], suggestions }) {
  const { data: user, loading, fn: fetchUser } = useFetch(findUser);

  const [liveData, setLiveData] = useState(data);
  const [fallDetected, setFallDetected] = useState(false);
  const alarmRef = useRef(null);

  /* ---------- FETCH USER ---------- */

  useEffect(() => {
    fetchUser();
  }, []);

  /* ---------- REALTIME SOCKET ---------- */

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    /* ---------- LIVE SENSOR UPDATE ---------- */
    socket.on("sensor_update", (record) => {
      setLiveData((prev) => [...prev.slice(-100), record]);
    });

    /* ---------- INSTANT FALL ALERT ---------- */
    socket.on("fall_alert", (record) => {
      console.log("🚨 FALL ALERT INSTANT");

      // show alert immediately (DO NOT WAIT)
      setFallDetected(true);

      // store latest fall record separately if needed
      setLiveData((prev) => [...prev.slice(-100), record]);

      // play sound instantly
      if (alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    });

    return () => {
      socket.off("sensor_update");
      socket.off("fall_alert");
      socket.disconnect();
    };
  }, []);

  /* ---------- DATA ---------- */

  const latest = liveData.length ? liveData[liveData.length - 1] : null;
  const alerts = getAlerts(latest);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500">
        Access denied
      </div>
    );
  }

  if (!latest) return <p>No data</p>;

  /* ---------- CHART ---------- */

  const chartData = liveData.map((d) => ({
    time: new Date(d.created_at).toLocaleTimeString(),
    heartrate: d.heartrate,
    spo2: d.spo2,
    temp: d.bodytemp,
    pressure: d.env_pressure,
    steps: d.stepcount,
  }));

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <audio ref={alarmRef} src="/alarm.mp3" preload="auto" />

      {fallDetected && (
        <div className="bg-red-700 border-2 border-red-400 p-5 rounded-xl text-center animate-pulse">
          <h2 className="text-2xl font-bold">🚨 FALL DETECTED</h2>
          <p>Immediate attention required</p>

          {latest && (
            <>
              <p className="text-sm">Device: {latest.device}</p>
              <p className="text-sm">
                {new Date(latest.created_at).toLocaleString()}
              </p>
            </>
          )}

          <button
            onClick={() => setFallDetected(false)}
            className="mt-4 px-4 py-2 bg-white text-red-700 rounded"
          >
            Acknowledge
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center">Health Monitoring</h1>

      <h2 className="text-indigo-300 font-bold">🤖 AI Health Insights</h2>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestions}</ReactMarkdown>

      {alerts.length > 0 && (
        <div className="bg-red-900 border border-red-500 p-4 rounded-xl">
          <h2 className="font-bold text-red-300">⚠ Health Alert</h2>
          {alerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Metric title="Heart Rate" value={`${latest.heartrate} bpm`} />
        <Metric title="SpO₂" value={`${latest.spo2}%`} />
        <Metric title="Temp" value={`${latest.bodytemp} °C`} />
        <Metric title="Pressure" value={`${latest.env_pressure} hPa`} />
        <Metric title="Steps" value={latest.stepcount} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Chart
          title="Heart Rate"
          data={chartData}
          dataKey="heartrate"
          color="#22c55e"
        />
        <Chart title="SpO₂" data={chartData} dataKey="spo2" color="#3b82f6" />
        <Chart
          title="Temperature"
          data={chartData}
          dataKey="temp"
          color="#ef4444"
        />
        <Chart
          title="Pressure"
          data={chartData}
          dataKey="pressure"
          color="#a855f7"
        />
      </div>

      <HealthChatbot latestData={latest} />
    </div>
  );
}
