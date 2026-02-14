import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "../../../../lib/prisma";
import UserDashboard from "./UserDashboard";

export default async function Page({ params }) {

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  /* ---------- OPTIONAL: ensure user accessing own data ---------- */
//   if (params.userid !== userId) {
//     redirect("/choose-role");
//   }

  /* ---------- GET HEALTH DATA ---------- */
  const healthData = await prisma.vulnerable_kit.findMany({
    orderBy: {
      created_at: "asc"
    }
  });

  return <UserDashboard data={healthData} />;
}