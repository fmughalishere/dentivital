import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import ShippingRate from "@/models/ShippingRate";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  label: z.string().trim().min(2).optional(),
  description: z.string().trim().max(200).optional(),
  price: z.coerce.number().min(0).optional(),
  minDays: z.coerce.number().min(0).optional(),
  maxDays: z.coerce.number().min(0).optional(),
  freeOver: z.coerce.number().min(0).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the shipping details." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const rate = await ShippingRate.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!rate) return NextResponse.json({ error: "Shipping rate not found." }, { status: 404 });
    return NextResponse.json({ rate: JSON.parse(JSON.stringify(rate)) });
  } catch (err) {
    console.error("[shipping/:id:PUT]", err);
    return NextResponse.json({ error: "We couldn't save that rate." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  try {
    await connectDB();
    const deleted = await ShippingRate.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Shipping rate not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[shipping/:id:DELETE]", err);
    return NextResponse.json({ error: "We couldn't delete that rate." }, { status: 500 });
  }
}
