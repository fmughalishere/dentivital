import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({ handled: z.boolean() });

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    await connectDB();
    const message = await Message.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ message: JSON.parse(JSON.stringify(message)) });
  } catch (err) {
    console.error("[admin/messages/:id:PATCH]", err);
    return NextResponse.json({ error: "We couldn't update that message." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  try {
    await connectDB();
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/messages/:id:DELETE]", err);
    return NextResponse.json({ error: "We couldn't delete that message." }, { status: 500 });
  }
}
