import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const data = await request.json();
    const goalie = await prisma.goalie.update({
      where: { id: Number(params.id) },
      data: {
        name: data.name,
        jerseyNumber: data.jerseyNumber ?? null
      }
    });
    return NextResponse.json(goalie);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to update goalie" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    await prisma.goalie.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to delete goalie" }, { status: 500 });
  }
}
