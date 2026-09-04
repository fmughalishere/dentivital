import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { attachSession, roleFor } from "@/lib/auth";
import type { SessionUser } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  marketingOptIn: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 }
    );
  }

  const { name, password, marketingOptIn } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      // A Google-first account can add a password instead of being rejected.
      if (!existing.passwordHash) {
        existing.passwordHash = await bcrypt.hash(password, 10);
        existing.provider = "password";
        if (!existing.name) existing.name = name;
        await existing.save();

        const session: SessionUser = {
          id: String(existing._id),
          name: existing.name,
          email: existing.email,
          role: existing.role,
          avatar: existing.avatar ?? null,
        };
        return attachSession(NextResponse.json({ user: session }), session);
      }
      return NextResponse.json(
        { error: "An account with that email already exists. Try signing in instead." },
        { status: 409 }
      );
    }

    const created = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      provider: "password",
      role: roleFor(email),
      marketingOptIn: Boolean(marketingOptIn),
    });

    const session: SessionUser = {
      id: String(created._id),
      name: created.name,
      email: created.email,
      role: created.role,
      avatar: null,
    };

    return attachSession(NextResponse.json({ user: session }, { status: 201 }), session);
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json(
      { error: "We couldn't create your account right now. Please try again." },
      { status: 500 }
    );
  }
}
