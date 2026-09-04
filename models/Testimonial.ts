import { Schema, models, model } from "mongoose";

export interface ITestimonial {
  _id?: string;
  name: string;
  quote: string;
  rating: number;
  avatar?: string;
  location?: string;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    avatar: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema);
