import { Schema, models, model } from "mongoose";

export interface ICoupon {
  _id?: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxRedemptions?: number | null;
  timesRedeemed: number;
  expiresAt?: Date | null;
  active: boolean;
  createdAt?: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    maxRedemptions: { type: Number, default: null },
    timesRedeemed: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Coupon || model<ICoupon>("Coupon", CouponSchema);
