import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { attachSession, isAdminEmail } from "@/lib/auth";
import type { SessionUser } from "@/types";

const schema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
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

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await connectDB();
    const user = await User.findOne({ email });

    // Same message for "no user" and "wrong password" so the form can't be
    // used to discover which emails have accounts.
    const invalid = NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    if (!user || !user.passwordHash) return invalid;
    if (user.disabled) {
      return NextResponse.json(
        { error: "This account has been disabled. Please contact support." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return invalid;

    // Promote if the email was added to ADMIN_EMAILS after sign-up.
    if (user.role !== "admin" && isAdminEmail(user.email)) {
      user.role = "admin";
      await user.save();
    }

    const session: SessionUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
    };

    return attachSession(NextResponse.json({ user: session }), session);
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}
