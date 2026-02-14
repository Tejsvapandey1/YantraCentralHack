"use client";

const LIMITS = {
  heartrate: { min: 60, max: 100 },
  spo2: { min: 95 },
  bodytemp: { max: 37.5 }
};

function getHealthStatus(latest) {
  if (
    latest.heartrate > LIMITS.heartrate.max ||
    latest.spo2 < LIMITS.spo2.min ||
    latest.bodytemp > LIMITS.bodytemp.max
  ) {
    return "warning";
  }

  return "good";
}

export default function UserDashboard({ data }) {
  if (!data.length) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        No health data available
      </div>
    );
  }

  const latest = data[data.length - 1];
  const status = getHealthStatus(latest);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">

      {/* ---------- TITLE ---------- */}
      <h1 className="text-3xl font-bold">My Health</h1>

      {/* ---------- HEALTH STATUS ---------- */}
      <div className={`p-6 rounded-xl border text-center text-lg font-semibold
        ${status === "good"
          ? "bg-green-900/40 border-green-500 text-green-300"
          : "bg-red-900/40 border-red-500 text-red-300"}
      `}>
        {status === "good" ? "✅ All Vitals Normal" : "⚠ Health Needs Attention"}
      </div>

      {/* ---------- VITALS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <VitalCard label="Heart Rate" value={`${latest.heartrate} bpm`} />
        <VitalCard label="Oxygen Level" value={`${latest.spo2}%`} />
        <VitalCard label="Body Temperature" value={`${latest.bodytemp} °C`} />

      </div>

      {/* ---------- FALL DETECTION ---------- */}
      {latest.fall_detected && (
        <div className="bg-red-900 border border-red-500 p-4 rounded-xl text-center font-bold">
          🚨 Fall Detected — Seek Help Immediately
        </div>
      )}

      {/* ---------- LOCATION ---------- */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <p className="text-gray-400">Last Known Location</p>
        <p className="font-semibold">
          Lat: {latest.latitude} | Long: {latest.longitude}
        </p>
      </div>

      {/* ---------- SIMPLE ADVICE ---------- */}
      <div className="bg-indigo-900/40 border border-indigo-500 p-4 rounded-xl">
        <p className="font-semibold mb-1">Health Advice</p>
        {status === "good"
          ? "Keep maintaining healthy activity and hydration."
          : "Please monitor your vitals and consult a doctor if symptoms persist."}
      </div>

    </div>
  );
}

function VitalCard({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl text-center">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}