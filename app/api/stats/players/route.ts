import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const players = await prisma.player.findMany({ include: { gameStats: true } });
  const response = players.map((player) => {
    const totals = player.gameStats.reduce(
      (acc, stat) => {
        acc.gamesPlayed += 1;
        acc.goals += stat.goals;
        acc.assists += stat.assists;
        acc.plusMinus += stat.plusMinus;
        acc.penaltyMinutes += stat.penaltyMinutes;
        return acc;
      },
      { gamesPlayed: 0, goals: 0, assists: 0, plusMinus: 0, penaltyMinutes: 0 }
    );
    const points = totals.goals + totals.assists;
    return { ...player, totals: { ...totals, points } };
  });
  return NextResponse.json(response);
}
