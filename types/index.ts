export type Role = "user" | "admin";

export type Product = {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category: string;
  ingredients: string[];
  benefits: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
};

export type Blog = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readMinutes: number;
  published: boolean;
  createdAt: string;
};

export type Testimonial = {
  _id: string;
  name: string;
  quote: string;
  rating: number;
  avatar?: string;
  location?: string;
};

export type Faq = {
  _id: string;
  question: string;
  answer: string;
  order: number;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
};

export type CouponType = "percent" | "fixed";

export type Coupon = {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export type ShippingRate = {
  _id: string;
  label: string;
  description: string;
  price: number;
  minDays: number;
  maxDays: number;
  freeOver: number | null;
  active: boolean;
  sortOrder: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export type Address = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type OrderEvent = {
  status: OrderStatus;
  note?: string;
  at: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: string;
  couponCode: string | null;
  shippingMethod: { label: string; price: number } | null;
  shippingAddress: Address | null;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  trackingNumber?: string | null;
  timeline: OrderEvent[];
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
};

export type AppUser = SessionUser & {
  phone?: string | null;
  address?: Address | null;
  marketingOptIn?: boolean;
  provider: "password" | "google";
  createdAt: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

export type Subscriber = {
  _id: string;
  email: string;
  createdAt: string;
};
