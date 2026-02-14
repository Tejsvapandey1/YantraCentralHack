"use server";

import { auth ,currentUser} from "@clerk/nextjs/server";
import prisma from "../lib/prisma";
import { redirect } from "next/navigation";

/* ---------- CREATE USER IN DB ---------- */
export async function createUser() {

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // get Clerk user details
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  /* ---------- CHECK IF USER ALREADY EXISTS ---------- */
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (existingUser) {
    return existingUser;
  }

  /* ---------- CREATE USER ---------- */
  const newUser = await prisma.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: clerkUser.firstName || "",
      role: "USER" // default role
    }
  });

  return newUser;
}

/* ---------- FIND CURRENT USER ---------- */
export async function findUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }
//   console.log(await prisma.user)
console.log("from user.js", userId)

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

/* ---------- SET USER ROLE ---------- */
export async function setUserRole(role) {

  /* ---------- VALIDATE ROLE ---------- */
  if (!["ADMIN", "USER"].includes(role)) {
    throw new Error("Invalid role");
  }

  /* ---------- AUTH ---------- */
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  /* ---------- FIND USER ---------- */
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  /* ---------- OPTIONAL: PREVENT ROLE CHANGE ---------- */
  // if role already selected, do not allow change
  if (user.role && user.role !== "USER") {
    // already admin or assigned
    redirect(user.role === "ADMIN" ? "/dashboard" : `/user/${userId}`);
  }

  /* ---------- UPDATE ROLE ---------- */
  await prisma.user.update({
    where: { clerkId: userId },
    data: { role }
  });

  /* ---------- REDIRECT ---------- */
  if (role === "ADMIN") {
    redirect("/dashboard");
  }

  redirect(`/user/${userId}`);
}