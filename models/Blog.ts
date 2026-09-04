import { Schema, models, model } from "mongoose";

export interface IBlog {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readMinutes: number;
  published: boolean;
  createdAt?: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "Dentivital Team" },
    tags: { type: [String], default: [] },
    readMinutes: { type: Number, default: 4 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Blog || model<IBlog>("Blog", BlogSchema);
