"use client";

import { useRouter } from "next/navigation";
import { setUserRole } from "../../../actions/user";

export default function ChooseRoleClient() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Select Your Role</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ADMIN */}
          <button
            onClick={() => setUserRole("ADMIN")}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-72 hover:border-indigo-500 hover:scale-105 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Care Taker</h2>
            <p className="text-gray-400 text-sm">
              Manage users, monitor system
            </p>
          </button>

          {/* USER */}
          <button
            onClick={() => setUserRole("USER")}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-72 hover:border-green-500 hover:scale-105 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">User</h2>
            <p className="text-gray-400 text-sm">View health monitoring</p>
          </button>
        </div>
      </div>
    </div>
  );
}
