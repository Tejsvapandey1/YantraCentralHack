"use client";

import { Metric } from "../../../components/metric";
import { Chart } from "../../../components/chart";
import { useEffect, useRef, useState } from "react";
import useFetch from "../../../hooks/use-fetch";
import { findUser } from "../../../actions/user";
import HealthChatbot from "../../../components/health-checkbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* -------- HEALTH LIMITS -------- */

const LIMITS = {
  heartrate: { min: 60, max: 100 },
  spo2: { min: 95, max: 100 },
  bodytemp: { min: 36.1, max: 37.5 },
  env_pressure: { min: 980, max: 1050 },
};

/* -------- ALERT CHECK -------- */

function getAlerts(latest) {
  if (!latest) return [];

  const alerts = [];

  if (
    latest.heartrate < LIMITS.heartrate.min ||
    latest.heartrate > LIMITS.heartrate.max
  )
    alerts.push("Abnormal Heart Rate");

  if (latest.spo2 < LIMITS.spo2.min) alerts.push("Low Oxygen Level");

  if (
    latest.bodytemp < LIMITS.bodytemp.min ||
    latest.bodytemp > LIMITS.bodytemp.max
  )
    alerts.push("Abnormal Body Temperature");

  if (
    latest.env_pressure < LIMITS.env_pressure.min ||
    latest.env_pressure > LIMITS.env_pressure.max
  )
    alerts.push("Abnormal Pressure");

  return alerts;
}

/* -------- MAIN DASHBOARD -------- */

export default function DashboardClient({ data, suggestions }) {
  const { data: user, loading, fn: fetchUser } = useFetch(findUser);

  /* ---------- LIVE STATE ---------- */

  const [liveData, setLiveData] = useState(data || []);
  const [fallDetected, setFallDetected] = useState(false);

  const alarmRef = useRef(null);

  /* ---------- FETCH USER ---------- */

  useEffect(() => {
    fetchUser();
  }, []);

  /* ---------- POLL SENSOR DATA ---------- */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/sensor/latest");
        const fresh = await res.json();
        setLiveData(fresh);
        // console.log(fresh);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------- DERIVED VALUES ---------- */

  const latest = liveData.length ? liveData[liveData.length - 1] : null;

  const alerts = getAlerts(latest);

  /* ---------- FALL DETECTION ---------- */

  const fallTimerRef = useRef(null);
const activeFallRecordRef = useRef(null);

useEffect(() => {
  if (!latest) return;

  const recordId = latest.id; // important unique identifier
  const isFall = Boolean(latest.fall_detected);

  console.log("Latest record:", recordId, "Fall:", isFall);

  /* ---------- FALL STARTED ---------- */
  if (isFall && activeFallRecordRef.current !== recordId) {
    console.log("New fall event detected");

    activeFallRecordRef.current = recordId;

    if (fallTimerRef.current) {
      clearTimeout(fallTimerRef.current);
    }

    fallTimerRef.current = setTimeout(() => {
      console.log("🚨 FALL CONFIRMED");

      setFallDetected(true);

      if (alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    }, 5000); // or 60000
  }

  /* ---------- FALL STOPPED ---------- */
  if (!isFall) {
    console.log("Fall stopped");

    activeFallRecordRef.current = null;

    if (fallTimerRef.current) {
      clearTimeout(fallTimerRef.current);
      fallTimerRef.current = null;
    }

    setFallDetected(false);
  }

}, [latest]);

  /* ---------- SAFETY RETURNS ---------- */

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500 text-xl">
        ❌ You are not allowed to access admin dashboard
      </div>
    );
  }

  if (!latest) return <p>No data</p>;

  /* ---------- CHART DATA ---------- */

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
        <div className="bg-red-700 border-2 border-red-400 text-white p-5 rounded-xl text-center animate-pulse shadow-2xl">
          <h2 className="text-2xl font-bold">🚨 FALL DETECTED</h2>
          <p className="mt-2 text-lg">
            Patient may have fallen. Immediate attention required.
          </p>
          <p className="text-sm opacity-80 mt-1">Device: {latest.device}</p>
          <p className="text-sm opacity-80">
            Time: {new Date(latest.created_at).toLocaleString()}
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center">Welcome CareTaker</h1>
      <h1 className="text-3xl font-bold">Health Monitoring</h1>

      <h2 className="font-bold text-indigo-300 text-lg">
        🤖 AI Health Insights (Last 15 Minutes)
      </h2>

      <div className="max-h-[320px] overflow-y-auto pr-2 text-sm text-gray-200 leading-relaxed scrollbar-hide">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestions}</ReactMarkdown>
      </div>

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
          title="Heart Rate Trend"
          data={chartData}
          dataKey="heartrate"
          color="#22c55e"
        />
        <Chart
          title="SpO₂ Trend"
          data={chartData}
          dataKey="spo2"
          color="#3b82f6"
        />
        <Chart
          title="Body Temperature Trend"
          data={chartData}
          dataKey="temp"
          color="#ef4444"
        />
        <Chart
          title="Pressure Trend"
          data={chartData}
          dataKey="pressure"
          color="#a855f7"
        />
      </div>

      <HealthChatbot latestData={latest} />
    </div>
  );
}
