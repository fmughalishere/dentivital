import { Schema, models, model } from "mongoose";

export interface ISubscriber {
  _id?: string;
  email: string;
  createdAt?: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default models.Subscriber || model<ISubscriber>("Subscriber", SubscriberSchema);
