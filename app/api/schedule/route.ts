import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth";

export async function GET() {
  const events = await prisma.scheduleEvent.findMany({
    orderBy: { date: "asc" },
    include: { rsvps: true, game: true }
  });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const event = await prisma.scheduleEvent.create({
      data: {
        date: new Date(data.date),
        opponent: data.opponent,
        location: data.location,
        isPractice: data.isPractice,
        time: data.time,
        gameId: data.gameId ?? null
      }
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
