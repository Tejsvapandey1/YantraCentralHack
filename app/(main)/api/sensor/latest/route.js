import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.vulnerable_kit.findMany({
    orderBy: { created_at: "asc" }
  });

  const safe = JSON.parse(JSON.stringify(data, (_, v) =>
    typeof v === "bigint" ? Number(v) : v
  ));

  return NextResponse.json(safe);
}