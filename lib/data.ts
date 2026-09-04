import { connectDB } from "@/lib/db";
import BlogModel from "@/models/Blog";
import CouponModel from "@/models/Coupon";
import FaqModel from "@/models/Faq";
import MessageModel from "@/models/Message";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import ShippingRateModel from "@/models/ShippingRate";
import SubscriberModel from "@/models/Subscriber";
import TestimonialModel from "@/models/Testimonial";
import UserModel from "@/models/User";
import type {
  AppUser,
  Blog,
  ContactMessage,
  Coupon,
  Faq,
  Order,
  Product,
  ShippingRate,
  Subscriber,
  Testimonial,
} from "@/types";

/**
 * Turns Mongoose documents into plain JSON that can cross the server/client
 * boundary (ObjectId and Date both become strings).
 */
function plain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Every reader fails soft. If MONGODB_URI isn't set yet, or the database is
 * unreachable, pages render their empty state instead of crashing the build.
 */
async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.MONGODB_URI) return fallback;
  try {
    await connectDB();
    return await run();
  } catch (err) {
    console.error("[data] query failed:", err);
    return fallback;
  }
}

/* -------------------------------------------------------------- products -- */

export function getProducts(options?: { includeInactive?: boolean }): Promise<Product[]> {
  return safe(async () => {
    const filter = options?.includeInactive ? {} : { active: { $ne: false } };
    const docs = await ProductModel.find(filter).sort({ createdAt: -1 }).lean();
    return plain<Product[]>(docs);
  }, []);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return (featured.length ? featured : products).slice(0, limit);
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return safe(async () => {
    const doc = await ProductModel.findOne({ slug: slug.toLowerCase() }).lean();
    return doc ? plain<Product>(doc) : null;
  }, null);
}

export function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return safe(async () => {
    const docs = await ProductModel.find({
      _id: { $ne: product._id },
      active: { $ne: false },
      category: product.category,
    })
      .limit(limit)
      .lean();
    if (docs.length >= limit) return plain<Product[]>(docs);
    const filler = await ProductModel.find({
      _id: { $nin: [product._id, ...docs.map((d) => d._id)] },
      active: { $ne: false },
    })
      .limit(limit - docs.length)
      .lean();
    return plain<Product[]>([...docs, ...filler]);
  }, []);
}

/* --------------------------------------------------------------- content -- */

export function getTestimonials(limit = 6): Promise<Testimonial[]> {
  return safe(async () => {
    const docs = await TestimonialModel.find().limit(limit).lean();
    return plain<Testimonial[]>(docs);
  }, []);
}

export function getFaqs(): Promise<Faq[]> {
  return safe(async () => {
    const docs = await FaqModel.find().sort({ order: 1 }).lean();
    return plain<Faq[]>(docs);
  }, []);
}

export function getBlogs(): Promise<Blog[]> {
  return safe(async () => {
    const docs = await BlogModel.find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();
    return plain<Blog[]>(docs);
  }, []);
}

export function getBlogBySlug(slug: string): Promise<Blog | null> {
  return safe(async () => {
    const doc = await BlogModel.findOne({ slug: slug.toLowerCase() }).lean();
    return doc ? plain<Blog>(doc) : null;
  }, null);
}

/* ------------------------------------------------------- shipping/coupons -- */

export function getShippingRates(options?: { includeInactive?: boolean }): Promise<ShippingRate[]> {
  return safe(async () => {
    const filter = options?.includeInactive ? {} : { active: { $ne: false } };
    const docs = await ShippingRateModel.find(filter).sort({ sortOrder: 1, price: 1 }).lean();
    return plain<ShippingRate[]>(docs);
  }, []);
}

export function getCoupons(): Promise<Coupon[]> {
  return safe(async () => {
    const docs = await CouponModel.find().sort({ createdAt: -1 }).lean();
    return plain<Coupon[]>(docs);
  }, []);
}

/* ----------------------------------------------------------------- orders -- */

/**
 * An order row is written before the customer is sent to Stripe, so every
 * abandoned or failed checkout leaves a "pending / unpaid" record behind.
 * Those were never real orders, so they stay out of the order lists by
 * default — pass `includeUnpaid` to see them.
 */
const PAID_ONLY = { paymentStatus: { $ne: "unpaid" } } as const;

export function getOrdersForUser(userId: string, includeUnpaid = false): Promise<Order[]> {
  return safe(async () => {
    const docs = await OrderModel.find({ userId, ...(includeUnpaid ? {} : PAID_ONLY) })
      .sort({ createdAt: -1 })
      .lean();
    return plain<Order[]>(docs);
  }, []);
}

export function getAllOrders(includeUnpaid = false): Promise<Order[]> {
  return safe(async () => {
    const docs = await OrderModel.find(includeUnpaid ? {} : PAID_ONLY)
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    return plain<Order[]>(docs);
  }, []);
}

export function getOrderById(id: string): Promise<Order | null> {
  return safe(async () => {
    const doc = await OrderModel.findById(id)
      .lean()
      .catch(() => null);
    return doc ? plain<Order>(doc) : null;
  }, null);
}

export function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  return safe(async () => {
    const doc = await OrderModel.findOne({ stripeSessionId: sessionId }).lean();
    return doc ? plain<Order>(doc) : null;
  }, null);
}

/* ------------------------------------------------------------------ users -- */

export function getUsers(): Promise<AppUser[]> {
  return safe(async () => {
    const docs = await UserModel.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    return plain<(AppUser & { _id: string })[]>(docs).map((u) => ({ ...u, id: u._id }));
  }, []);
}

export function getUserById(id: string): Promise<AppUser | null> {
  return safe(async () => {
    const doc = await UserModel.findById(id)
      .select("-passwordHash")
      .lean()
      .catch(() => null);
    if (!doc) return null;
    const u = plain<AppUser & { _id: string }>(doc);
    return { ...u, id: u._id };
  }, null);
}

/* ------------------------------------------------------------------ inbox -- */

export function getMessages(): Promise<ContactMessage[]> {
  return safe(async () => {
    const docs = await MessageModel.find().sort({ createdAt: -1 }).limit(200).lean();
    return plain<ContactMessage[]>(docs);
  }, []);
}

export function getSubscribers(): Promise<Subscriber[]> {
  return safe(async () => {
    const docs = await SubscriberModel.find().sort({ createdAt: -1 }).limit(500).lean();
    return plain<Subscriber[]>(docs);
  }, []);
}

/* -------------------------------------------------------------- analytics -- */

export type DashboardStats = {
  revenue: number;
  orders: number;
  paidOrders: number;
  pendingOrders: number;
  customers: number;
  products: number;
  lowStock: number;
  averageOrderValue: number;
  revenueByDay: { date: string; total: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
};

export function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    revenue: 0,
    orders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    customers: 0,
    products: 0,
    lowStock: 0,
    averageOrderValue: 0,
    revenueByDay: [],
    topProducts: [],
  };

  return safe(async () => {
    const [orders, customers, products, lowStock] = await Promise.all([
      OrderModel.find(PAID_ONLY).sort({ createdAt: -1 }).limit(500).lean(),
      UserModel.countDocuments({ role: "user" }),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stock: { $lte: 10 } }),
    ]);

    const list = plain<Order[]>(orders);
    const paid = list.filter((o) => o.paymentStatus === "paid");
    const revenue = paid.reduce((sum, o) => sum + (o.total ?? 0), 0);

    // Last 14 days of paid revenue, oldest first.
    const days: { date: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = paid
        .filter((o) => (o.createdAt ?? "").slice(0, 10) === key)
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ date: key, total: Math.round(total * 100) / 100 });
    }

    const productTotals = new Map<string, { quantity: number; revenue: number }>();
    for (const order of paid) {
      for (const item of order.items ?? []) {
        const current = productTotals.get(item.name) ?? { quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        productTotals.set(item.name, current);
      }
    }

    return {
      revenue: Math.round(revenue * 100) / 100,
      orders: list.length,
      paidOrders: paid.length,
      pendingOrders: list.filter((o) => o.status === "pending").length,
      customers,
      products,
      lowStock,
      averageOrderValue: paid.length ? Math.round((revenue / paid.length) * 100) / 100 : 0,
      revenueByDay: days,
      topProducts: [...productTotals.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    };
  }, empty);
}
