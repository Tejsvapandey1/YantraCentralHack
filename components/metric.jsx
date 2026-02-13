export function Metric({ title, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}