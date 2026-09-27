import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriberDocument extends Document {
  email: string;
  isActive: boolean;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'website-footer' },
  },
  { timestamps: true }
);

const Subscriber: Model<ISubscriberDocument> =
  mongoose.models.Subscriber || mongoose.model<ISubscriberDocument>('Subscriber', SubscriberSchema);

export default Subscriber;
