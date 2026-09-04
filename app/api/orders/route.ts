import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    await connectDB();
    const isAdmin = session.role === "admin";
    const status = req.nextUrl.searchParams.get("status");

    const filter: Record<string, unknown> = isAdmin ? {} : { userId: session.id };
    if (status && status !== "all") {
      filter.status = status;
    } else {
      // An abandoned or failed checkout leaves a pending-unpaid row behind.
      // Those were never real orders, so keep them out of the default listing.
      filter.paymentStatus = { $ne: "unpaid" };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
  } catch (err) {
    console.error("[orders:GET]", err);
    return NextResponse.json({ orders: [] });
  }
}
