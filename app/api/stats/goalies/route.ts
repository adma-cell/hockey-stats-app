import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const goalies = await prisma.goalie.findMany({ include: { gameStats: true } });
  const response = goalies.map((goalie) => {
    const totals = goalie.gameStats.reduce(
      (acc, stat) => {
        acc.gamesPlayed += 1;
        acc.shotsAgainst += stat.shotsAgainst;
        acc.saves += stat.saves;
        acc.goalsAllowed += stat.goalsAllowed;
        acc.shutouts += stat.shutout ? 1 : 0;
        acc.minutesPlayed += stat.minutesPlayed;
        return acc;
      },
      { gamesPlayed: 0, shotsAgainst: 0, saves: 0, goalsAllowed: 0, shutouts: 0, minutesPlayed: 0 }
    );
    const savePct = totals.shotsAgainst === 0 ? 0 : totals.saves / totals.shotsAgainst;
    return { ...goalie, totals: { ...totals, savePct } };
  });
  return NextResponse.json(response);
}
