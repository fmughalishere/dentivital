import { Schema, models, model } from "mongoose";

export interface IProduct {
  _id?: string;
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
  createdAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    category: { type: String, default: "whitening", index: true },
    ingredients: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 100, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
