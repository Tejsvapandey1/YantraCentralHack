import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export function Chart({ title, data, dataKey, color }) {
  const gradientId = `gradient-${dataKey}`;

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
      <h2 className="mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>

          {/* ---------- GRADIENT ---------- */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip />

          {/* ---------- AREA GLOW ---------- */}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="none"
            fill={`url(#${gradientId})`}
          />

          {/* ---------- LINE ---------- */}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={false}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}