import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.coerce.number().positive().optional(),
  minSubtotal: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the discount details." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.expiresAt !== undefined) {
      update.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }
    const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!coupon) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    return NextResponse.json({ coupon: JSON.parse(JSON.stringify(coupon)) });
  } catch (err) {
    console.error("[coupons/:id:PUT]", err);
    return NextResponse.json({ error: "We couldn't save that discount." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  try {
    await connectDB();
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[coupons/:id:DELETE]", err);
    return NextResponse.json({ error: "We couldn't delete that discount." }, { status: 500 });
  }
}
