import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import ShippingRate from "@/models/ShippingRate";
import { forbidden, getAdminFromRequest } from "@/lib/auth";
import { DEFAULT_SHIPPING_RATES } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const isAdmin = Boolean(getAdminFromRequest(req));
    const wantsAll = req.nextUrl.searchParams.get("all") === "1" && isAdmin;

    let rates = await ShippingRate.find(wantsAll ? {} : { active: { $ne: false } })
      .sort({ sortOrder: 1, price: 1 })
      .lean();

    // First run: create sensible defaults so checkout is never blocked.
    if (rates.length === 0) {
      await ShippingRate.insertMany(DEFAULT_SHIPPING_RATES);
      rates = await ShippingRate.find({ active: { $ne: false } })
        .sort({ sortOrder: 1, price: 1 })
        .lean();
    }

    return NextResponse.json({ rates: JSON.parse(JSON.stringify(rates)) });
  } catch (err) {
    console.error("[shipping:GET]", err);
    return NextResponse.json({ rates: [] });
  }
}

const rateSchema = z.object({
  label: z.string().trim().min(2, "Give the shipping method a name."),
  description: z.string().trim().max(200).optional().default(""),
  price: z.coerce.number().min(0),
  minDays: z.coerce.number().min(0).optional().default(3),
  maxDays: z.coerce.number().min(0).optional().default(7),
  freeOver: z.coerce.number().min(0).nullable().optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().optional().default(0),
});

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return forbidden();

  const parsed = rateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the shipping details." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const rate = await ShippingRate.create(parsed.data);
    return NextResponse.json({ rate: JSON.parse(JSON.stringify(rate)) }, { status: 201 });
  } catch (err) {
    console.error("[shipping:POST]", err);
    return NextResponse.json({ error: "We couldn't create that rate." }, { status: 500 });
  }
}
