import Link from "next/link";
import { setUserRole } from "../../../actions/user";
import { auth } from "@clerk/nextjs/server";

export default  async function ChooseRole() {
  const {userId} = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Select Your Role</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ---------- ADMIN ---------- */}

          <button
            onClick={() => setUserRole("ADMIN")}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-72 hover:border-indigo-500 hover:scale-105 transition shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-2">CareGiver</h2>
            <p className="text-gray-400 text-sm">
              Manage users, monitor system, control data
            </p>
          </button>

          {/* ---------- USER ---------- */}
          <button
            onClick={() => setUserRole("USER")}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-72 hover:border-green-500 hover:scale-105 transition shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-2">User</h2>
            <p className="text-gray-400 text-sm">
              View health monitoring and insights
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
