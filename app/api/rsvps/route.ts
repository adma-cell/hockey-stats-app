import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const where = eventId ? { eventId: Number(eventId) } : {};
  const rsvps = await prisma.rSVP.findMany({ where });
  return NextResponse.json(rsvps);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        status: data.status
      }
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
