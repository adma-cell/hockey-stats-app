import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const game = await prisma.game.update({
      where: { id: Number(params.id) },
      data: {
        opponent: data.opponent,
        date: new Date(data.date),
        finalScore: data.finalScore ?? null,
        location: data.location ?? null
      }
    });
    return NextResponse.json(game);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    await prisma.game.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }
}
