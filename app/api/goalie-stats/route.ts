import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const record = await prisma.goalieGameStat.upsert({
      where: { gameId_goalieId: { gameId: data.gameId, goalieId: data.goalieId } },
      update: {
        shotsAgainst: data.shotsAgainst,
        saves: data.saves,
        goalsAllowed: data.goalsAllowed,
        shutout: data.shutout,
        minutesPlayed: data.minutesPlayed
      },
      create: {
        gameId: data.gameId,
        goalieId: data.goalieId,
        shotsAgainst: data.shotsAgainst,
        saves: data.saves,
        goalsAllowed: data.goalsAllowed,
        shutout: data.shutout,
        minutesPlayed: data.minutesPlayed
      }
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to save goalie stat" }, { status: 500 });
  }
}
