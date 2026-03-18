import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function GET() {
  const players = await prisma.player.findMany({ orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }] });
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const player = await prisma.player.create({
      data: {
        name: data.name,
        jerseyNumber: data.jerseyNumber ?? null,
        position: data.position ?? null
      }
    });
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
