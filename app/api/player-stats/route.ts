import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const record = await prisma.playerGameStat.upsert({
      where: { gameId_playerId: { gameId: data.gameId, playerId: data.playerId } },
      update: {
        goals: data.goals,
        assists: data.assists,
        plusMinus: data.plusMinus,
        penaltyMinutes: data.penaltyMinutes
      },
      create: {
        gameId: data.gameId,
        playerId: data.playerId,
        goals: data.goals,
        assists: data.assists,
        plusMinus: data.plusMinus,
        penaltyMinutes: data.penaltyMinutes
      }
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to save stat" }, { status: 500 });
  }
}
