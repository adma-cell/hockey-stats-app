import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function GET() {
  const games = await prisma.game.findMany({
    orderBy: { date: "desc" },
    include: {
      playerStats: { include: { player: true } },
      goalieStats: { include: { goalie: true } }
    }
  });
  return NextResponse.json(games);
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const game = await prisma.game.create({
      data: {
        opponent: data.opponent,
        date: new Date(data.date),
        finalScore: data.finalScore ?? null,
        location: data.location ?? null
      }
    });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}
