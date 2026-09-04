import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(session.id);
    if (!user) return unauthorized("Your session has expired. Please sign in again.");

    // Accounts created through Google have no password yet — they can set one
    // without providing a current password.
    if (user.passwordHash) {
      if (!parsed.data.currentPassword) {
        return NextResponse.json({ error: "Please enter your current password." }, { status: 400 });
      }
      const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Your current password is incorrect." }, { status: 401 });
      }
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    if (user.provider === "google" && !user.googleId) user.provider = "password";
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/password]", err);
    return NextResponse.json({ error: "We couldn't update your password." }, { status: 500 });
  }
}
