import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { evaluateCoupon } from "@/lib/pricing";
import type { Coupon as CouponType } from "@/types";

const schema = z.object({
  code: z.string().trim().min(1, "Enter a discount code."),
  subtotal: z.coerce.number().min(0),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a discount code." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const doc = await Coupon.findOne({ code: parsed.data.code.trim().toUpperCase() }).lean();
    const coupon = doc ? (JSON.parse(JSON.stringify(doc)) as CouponType) : null;

    const result = evaluateCoupon(coupon, parsed.data.subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ coupon: result.coupon, discount: result.discount });
  } catch (err) {
    console.error("[coupons/validate]", err);
    return NextResponse.json({ error: "We couldn't check that code." }, { status: 500 });
  }
}
