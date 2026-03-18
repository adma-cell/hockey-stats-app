import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const player = await prisma.player.update({
      where: { id: Number(params.id) },
      data: {
        name: data.name,
        jerseyNumber: data.jerseyNumber ?? null,
        position: data.position ?? null
      }
    });
    return NextResponse.json(player);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    await prisma.player.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
  }
}
