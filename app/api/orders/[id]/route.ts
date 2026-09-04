import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { forbidden, getSessionFromRequest, unauthorized } from "@/lib/auth";
import { ORDER_STATUSES } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  const { id } = await params;

  try {
    await connectDB();
    const order = await Order.findById(id)
      .lean()
      .catch(() => null);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const owner = String((order as { userId?: string | null }).userId ?? "") === session.id;
    if (!owner && session.role !== "admin") return forbidden();

    return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) });
  } catch (err) {
    console.error("[orders/:id:GET]", err);
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]).optional(),
  trackingNumber: z.string().trim().max(80).nullable().optional(),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (session.role !== "admin") return forbidden();
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the update." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const order = await Order.findById(id).catch(() => null);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (parsed.data.trackingNumber !== undefined) {
      order.trackingNumber = parsed.data.trackingNumber;
    }

    if (parsed.data.status && parsed.data.status !== order.status) {
      order.status = parsed.data.status as typeof order.status;
      if (parsed.data.status === "refunded") order.paymentStatus = "refunded";
      if (["paid", "processing", "shipped", "delivered"].includes(parsed.data.status)) {
        order.paymentStatus = "paid";
      }
      order.timeline.push({
        status: order.status,
        note: parsed.data.note || `Status changed to ${order.status}.`,
        at: new Date(),
      });
    } else if (parsed.data.note) {
      order.timeline.push({ status: order.status, note: parsed.data.note, at: new Date() });
    }

    await order.save();
    return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) });
  } catch (err) {
    console.error("[orders/:id:PATCH]", err);
    return NextResponse.json({ error: "We couldn't update that order." }, { status: 500 });
  }
}
