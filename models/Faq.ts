import { Schema, models, model } from "mongoose";

export interface IFaq {
  _id?: string;
  question: string;
  answer: string;
  order: number;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Faq || model<IFaq>("Faq", FaqSchema);
