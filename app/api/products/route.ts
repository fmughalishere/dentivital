import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getAdminFromRequest, forbidden } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const includeInactive = req.nextUrl.searchParams.get("all") === "1";
    const isAdmin = Boolean(getAdminFromRequest(req));
    const filter = includeInactive && isAdmin ? {} : { active: { $ne: false } };
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
  } catch (err) {
    console.error("[products:GET]", err);
    return NextResponse.json({ products: [] });
  }
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  slug: z.string().trim().optional(),
  shortDescription: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().optional().default(""),
  price: z.coerce.number().min(0, "Price must be zero or more."),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  images: z.array(z.string()).optional().default([]),
  category: z.string().trim().optional().default("whitening"),
  ingredients: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  rating: z.coerce.number().min(0).max(5).optional().default(5),
  reviewCount: z.coerce.number().min(0).optional().default(0),
  stock: z.coerce.number().min(0).optional().default(0),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return forbidden();

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the product details." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const slug = slugify(parsed.data.slug || parsed.data.name);

    const clash = await Product.findOne({ slug });
    if (clash) {
      return NextResponse.json(
        { error: "A product with that URL slug already exists." },
        { status: 409 }
      );
    }

    const product = await Product.create({ ...parsed.data, slug });
    return NextResponse.json({ product: JSON.parse(JSON.stringify(product)) }, { status: 201 });
  } catch (err) {
    console.error("[products:POST]", err);
    return NextResponse.json({ error: "We couldn't create that product." }, { status: 500 });
  }
}
