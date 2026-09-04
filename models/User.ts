import { Schema, models, model } from "mongoose";

export interface IAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  avatar?: string | null;
  phone?: string | null;
  role: "user" | "admin";
  provider: "password" | "google";
  googleId?: string | null;
  address?: IAddress | null;
  marketingOptIn: boolean;
  disabled: boolean;
  createdAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "US" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Null for Google-only accounts.
    passwordHash: { type: String, default: null },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    provider: { type: String, enum: ["password", "google"], default: "password" },
    googleId: { type: String, default: null },
    address: { type: AddressSchema, default: null },
    marketingOptIn: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
