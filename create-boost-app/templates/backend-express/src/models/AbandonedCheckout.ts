import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAbandonedCheckoutDocument extends Document {
  email?: string;
  phone?: string;
  customerName?: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
  recovered: boolean;
  recoveryEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCheckoutSchema = new Schema(
  {
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    customerName: { type: String, trim: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    recovered: { type: Boolean, default: false },
    recoveryEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AbandonedCheckout: Model<IAbandonedCheckoutDocument> =
  mongoose.models.AbandonedCheckout ||
  mongoose.model<IAbandonedCheckoutDocument>('AbandonedCheckout', AbandonedCheckoutSchema);

export default AbandonedCheckout;
