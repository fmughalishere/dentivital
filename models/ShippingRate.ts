import { Schema, models, model } from "mongoose";

export interface IShippingRate {
  _id?: string;
  label: string;
  description: string;
  price: number;
  minDays: number;
  maxDays: number;
  freeOver?: number | null;
  active: boolean;
  sortOrder: number;
}

const ShippingRateSchema = new Schema<IShippingRate>(
  {
    label: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    minDays: { type: Number, default: 3, min: 0 },
    maxDays: { type: Number, default: 7, min: 0 },
    freeOver: { type: Number, default: null },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.ShippingRate || model<IShippingRate>("ShippingRate", ShippingRateSchema);
