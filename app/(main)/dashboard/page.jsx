import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";

import TestPage from "../../../lib/test";
import { getHealthSuggestions } from "../../../lib/gemini";
import DashboardClient from "./DashboardClient";

export default async function Page() {

  /* ---------- AUTH ---------- */
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  console.log(userId);

  /* ---------- FIND USER ---------- */
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    redirect("/choose-role");
  }

  /* ---------- ROLE CHECK ---------- */
  if (user.role !== "ADMIN") {
    redirect("/user?error=not-allowed");
  }

  /* ---------- ADMIN DATA ---------- */
  const data = await TestPage();
  const suggestions = await getHealthSuggestions(data);

  console.log(data[0]);

  return (
    <DashboardClient
      data={data}
      suggestions={suggestions}
      user={user}
    />
  );
}