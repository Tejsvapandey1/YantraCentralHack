"use client";

import { Metric } from "../../../components/metric";
import { Chart } from "../../../components/chart";
import { useEffect } from "react";
import useFetch from "../../../hooks/use-fetch";
import { findUser } from "../../../actions/user";

/* -------- HEALTH LIMITS -------- */

const LIMITS = {
  heartrate: { min: 60, max: 100 },
  spo2: { min: 95, max: 100 },
  bodytemp: { min: 36.1, max: 37.5 },
  env_pressure: { min: 980, max: 1050 },
};

/* -------- ALERT CHECK -------- */

function getAlerts(latest) {
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

  useEffect(async () => {
    await fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500 text-xl">
        ❌ You are not allowed to access admin dashboard
      </div>
    );
  }

  if (!data.length) return <p>No data</p>;

  const latest = data[data.length - 1];

  const chartData = data.map((d) => ({
    time: new Date(d.created_at).toLocaleTimeString(),
    heartrate: d.heartrate,
    spo2: d.spo2,
    temp: d.bodytemp,
    pressure: d.env_pressure,
    steps: d.stepcount,
  }));

  const alerts = getAlerts(latest);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome Admin</h1>
      <h1 className="text-3xl font-bold">Health Monitoring</h1>

     

      {suggestions && suggestions.trim() !== "" && (
        <div className="bg-indigo-900/40 border border-indigo-500 p-5 rounded-xl">
          <h2 className="font-bold text-indigo-300 mb-2">
            🤖 AI Health Insights (Last 15 Minutes)
          </h2>

          <pre className="whitespace-pre-wrap text-sm text-gray-200">
            {suggestions}
          </pre>
        </div>
      )}

      {/* -------- ALERT PANEL -------- */}

      {alerts.length > 0 && (
        <div className="bg-red-900 border border-red-500 p-4 rounded-xl">
          <h2 className="font-bold text-red-300">⚠ Health Alert</h2>
          {alerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      {/* -------- METRICS -------- */}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Metric title="Heart Rate" value={`${latest.heartrate} bpm`} />
        <Metric title="SpO₂" value={`${latest.spo2}%`} />
        <Metric title="Temp" value={`${latest.bodytemp} °C`} />
        <Metric title="Pressure" value={`${latest.env_pressure} hPa`} />
        <Metric title="Steps" value={latest.stepcount} />
      </div>

      {/* -------- GRAPHS -------- */}

      {/* -------- GRAPHS GRID -------- */}

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
    </div>
  );
}

/* -------- METRIC CARD -------- */

/* -------- CHART -------- */
