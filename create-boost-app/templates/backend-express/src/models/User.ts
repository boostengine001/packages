import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAddress {
  _id?: any;
  name: string;
  address: string;
  address2?: string;
  landmark?: string;
  city: string;
  state?: string;
  country?: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'staff';
  isGuest?: boolean;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  address2: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  zip: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, sparse: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
    isGuest: { type: Boolean, default: false },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
