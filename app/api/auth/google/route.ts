import { NextResponse, type NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { attachSession, isAdminEmail, roleFor } from "@/lib/auth";
import type { SessionUser } from "@/types";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export async function POST(req: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "Google sign-in isn't configured. Add GOOGLE_CLIENT_ID to your environment." },
      { status: 501 }
    );
  }

  const { credential } = (await req.json().catch(() => ({}))) as { credential?: string };
  if (!credential) {
    return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
  }

  try {
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json(
        { error: "Google did not return a verified email address." },
        { status: 401 }
      );
    }

    const email = payload.email.toLowerCase();

    await connectDB();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        passwordHash: null,
        avatar: payload.picture ?? null,
        provider: "google",
        googleId: payload.sub,
        role: roleFor(email),
      });
    } else {
      if (user.disabled) {
        return NextResponse.json(
          { error: "This account has been disabled. Please contact support." },
          { status: 403 }
        );
      }
      // Link the Google identity to the existing email/password account.
      let changed = false;
      if (!user.googleId) {
        user.googleId = payload.sub ?? null;
        changed = true;
      }
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
        changed = true;
      }
      if (user.role !== "admin" && isAdminEmail(email)) {
        user.role = "admin";
        changed = true;
      }
      if (changed) await user.save();
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
    console.error("[auth/google]", err);
    return NextResponse.json(
      { error: "We couldn't verify that Google account. Please try again." },
      { status: 401 }
    );
  }
}
