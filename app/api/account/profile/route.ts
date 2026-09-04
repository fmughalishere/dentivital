import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { attachSession, getSessionFromRequest, unauthorized } from "@/lib/auth";
import type { SessionUser } from "@/types";

const addressSchema = z.object({
  fullName: z.string().trim().max(120).optional().default(""),
  line1: z.string().trim().max(160).optional().default(""),
  line2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  state: z.string().trim().max(80).optional().default(""),
  postalCode: z.string().trim().max(24).optional().default(""),
  country: z.string().trim().max(60).optional().default("US"),
  phone: z.string().trim().max(40).optional().default(""),
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80).optional(),
  phone: z.string().trim().max(40).optional(),
  marketingOptIn: z.boolean().optional(),
  address: addressSchema.optional(),
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

    const { name, phone, marketingOptIn, address } = parsed.data;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (marketingOptIn !== undefined) user.marketingOptIn = marketingOptIn;
    if (address !== undefined) user.address = address;
    await user.save();

    const next: SessionUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
    };

    const plain = JSON.parse(JSON.stringify(user.toObject())) as Record<string, unknown>;
    delete plain.passwordHash;

    // Re-issue the cookie so the header shows the updated name immediately.
    return attachSession(NextResponse.json({ user: { ...plain, id: next.id } }), next);
  } catch (err) {
    console.error("[account/profile]", err);
    return NextResponse.json({ error: "We couldn't save your changes." }, { status: 500 });
  }
}
