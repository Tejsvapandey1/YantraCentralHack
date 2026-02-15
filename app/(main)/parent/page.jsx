export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center space-y-4">

        <h1 className="text-3xl font-bold text-blue-400">
          User Dashboard
        </h1>

        <p className="text-gray-400">
          Welcome to your health monitoring panel.
        </p>

        <div className="mt-6 space-y-2 text-sm text-gray-300">
          <p>✔ Device connected</p>
          <p>✔ Monitoring active</p>
          <p>✔ Alerts enabled</p>
        </div>

      </div>

    </div>
  );
}