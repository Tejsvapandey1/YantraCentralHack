import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import prisma from "./lib/prisma";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
]);
console.log("are you even working")

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // not logged in → ignore
  if (!userId) return;

  // skip public routes if you want (optional)
  if (isPublicRoute(req)) return;

  /* ---------- CHECK USER IN DB ---------- */
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!existingUser) {
    // fetch Clerk user info
    const clerkUser = await auth().user;

    await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        name: clerkUser?.firstName || "",
        role: "USER",
      },
    });

    console.log("User auto-created in DB");
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
