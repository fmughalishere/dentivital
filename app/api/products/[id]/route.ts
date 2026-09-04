import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { forbidden, getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await connectDB();
    const product =
      (await Product.findOne({ slug: id.toLowerCase() }).lean()) ??
      (await Product.findById(id)
        .lean()
        .catch(() => null));
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: JSON.parse(JSON.stringify(product)) });
  } catch (err) {
    console.error("[products/:id:GET]", err);
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().optional(),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0).optional(),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().trim().optional(),
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the product details." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.slug || parsed.data.name) {
      update.slug = slugify(parsed.data.slug || parsed.data.name!);
      const clash = await Product.findOne({ slug: update.slug, _id: { $ne: id } });
      if (clash) {
        return NextResponse.json(
          { error: "Another product already uses that URL slug." },
          { status: 409 }
        );
      }
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: JSON.parse(JSON.stringify(product)) });
  } catch (err) {
    console.error("[products/:id:PUT]", err);
    return NextResponse.json({ error: "We couldn't save that product." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!getAdminFromRequest(req)) return forbidden();
  const { id } = await params;

  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[products/:id:DELETE]", err);
    return NextResponse.json({ error: "We couldn't delete that product." }, { status: 500 });
  }
}
