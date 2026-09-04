import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { forbidden, getAdminFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  disabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return forbidden();
  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "You can't change your own role or access from here." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, parsed.data, { new: true })
      .select("-passwordHash")
      .lean();
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
  } catch (err) {
    console.error("[admin/users/:id:PATCH]", err);
    return NextResponse.json({ error: "We couldn't update that user." }, { status: 500 });
  }
}
