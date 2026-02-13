import prisma from "./prisma";

export default async function TestPage() {
  return await prisma.vulnerable_kit.findMany();
}