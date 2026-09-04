import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) return forbidden();
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons: JSON.parse(JSON.stringify(coupons)) });
  } catch (err) {
    console.error("[coupons:GET]", err);
    return NextResponse.json({ coupons: [] });
  }
}

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Codes need at least 3 characters.")
    .max(24)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, dashes or underscores only."),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Discount value must be greater than zero."),
  minSubtotal: z.coerce.number().min(0).optional().default(0),
  maxRedemptions: z.coerce.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return forbidden();

  const parsed = couponSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the discount details." },
      { status: 400 }
    );
  }
  if (parsed.data.type === "percent" && parsed.data.value > 100) {
    return NextResponse.json({ error: "A percentage discount can't exceed 100." }, { status: 400 });
  }

  try {
    await connectDB();
    const code = parsed.data.code.toUpperCase();
    if (await Coupon.findOne({ code })) {
      return NextResponse.json({ error: "That code already exists." }, { status: 409 });
    }

    const coupon = await Coupon.create({
      ...parsed.data,
      code,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      timesRedeemed: 0,
    });

    return NextResponse.json({ coupon: JSON.parse(JSON.stringify(coupon)) }, { status: 201 });
  } catch (err) {
    console.error("[coupons:POST]", err);
    return NextResponse.json({ error: "We couldn't create that discount." }, { status: 500 });
  }
}
