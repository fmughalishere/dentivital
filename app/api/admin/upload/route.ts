import { NextResponse, type NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return forbidden();

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      {
        error:
          "Image uploads aren't configured. Add your CLOUDINARY_* keys, or paste an image URL instead.",
      },
      { status: 501 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, WebP or AVIF image." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be 6 MB or smaller." }, { status: 413 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "dentivital/products",
      resource_type: "image",
    });
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("[admin/upload]", err);
    return NextResponse.json({ error: "The upload failed. Please try again." }, { status: 500 });
  }
}
