import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { clearSession, getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  try {
    await connectDB();
    const doc = await User.findById(session.id)
      .select("-passwordHash")
      .lean()
      .catch(() => null);

    if (!doc || (doc as { disabled?: boolean }).disabled) {
      return clearSession(NextResponse.json({ user: null }));
    }

    const user = JSON.parse(JSON.stringify(doc)) as Record<string, unknown> & { _id: string };
    return NextResponse.json({ user: { ...user, id: user._id } });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ user: session });
  }
}
