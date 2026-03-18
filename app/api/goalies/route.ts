import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function GET() {
  const goalies = await prisma.goalie.findMany({ orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }] });
  return NextResponse.json(goalies);
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const goalie = await prisma.goalie.create({
      data: {
        name: data.name,
        jerseyNumber: data.jerseyNumber ?? null
      }
    });
    return NextResponse.json(goalie, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to create goalie" }, { status: 500 });
  }
}
