import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChooseRoleClient from "./choose-role-client";
import { createUser } from "../../../actions/user";

export default async function ChooseRolePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

 await createUser();

  

  return <ChooseRoleClient />;
}
