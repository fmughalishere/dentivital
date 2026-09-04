import { Schema, models, model } from "mongoose";

export interface IMessage {
  _id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  handled: boolean;
  createdAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>("Message", MessageSchema);
