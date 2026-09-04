import { Schema, models, model } from "mongoose";
// Relative (not "@/") so the seed script can import this model directly.
import { STRIPE_CURRENCY } from "../lib/currency";

/** Kept in sync with `OrderStatus` in types/index.ts. Declared inline so the
 *  seed script can import this model without the "@/" path alias. */
type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrderEvent {
  status: OrderStatus;
  note?: string;
  at: Date;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  userId?: string | null;
  email: string;
  customerName: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: string;
  couponCode?: string | null;
  shippingMethod?: { label: string; price: number } | null;
  shippingAddress?: Record<string, string> | null;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  trackingNumber?: string | null;
  timeline: IOrderEvent[];
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    slug: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const OrderEventSchema = new Schema<IOrderEvent>(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerName: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: STRIPE_CURRENCY },
    couponCode: { type: String, default: null },
    shippingMethod: { type: Schema.Types.Mixed, default: null },
    shippingAddress: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    stripeSessionId: { type: String, default: null, index: true },
    paymentIntentId: { type: String, default: null },
    trackingNumber: { type: String, default: null },
    timeline: { type: [OrderEventSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
