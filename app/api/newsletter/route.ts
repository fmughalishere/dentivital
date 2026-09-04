import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";

const schema = z.object({ email: z.email("Please enter a valid email address.") });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please enter a valid email." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await connectDB();
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Already subscribed is a success from the visitor's point of view.
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    await Subscriber.create({ email });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "We couldn't sign you up just now." }, { status: 500 });
  }
}
