import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name."),
  email: z.email("Please enter a valid email address."),
  subject: z.string().trim().max(140).optional().default(""),
  message: z.string().trim().min(10, "Please write at least a sentence or two."),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    await Message.create(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "We couldn't send your message." }, { status: 500 });
  }
}
