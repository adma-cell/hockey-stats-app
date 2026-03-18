import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const event = await prisma.scheduleEvent.update({
      where: { id: Number(params.id) },
      data: {
        date: new Date(data.date),
        opponent: data.opponent,
        location: data.location,
        isPractice: data.isPractice,
        time: data.time,
        gameId: data.gameId ?? null
      }
    });
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    await prisma.scheduleEvent.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
