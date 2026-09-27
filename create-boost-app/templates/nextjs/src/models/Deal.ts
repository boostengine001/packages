import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDealDocument extends Document {
  productId: string;
  productTitle: string;
  productImage: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  quotaUnits: number;
  claimedUnits: number;
  startTime: Date;
  endTime: Date;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    productTitle: { type: String, required: true },
    productImage: { type: String, default: '' },
    originalPrice: { type: Number, required: true },
    dealPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    quotaUnits: { type: Number, default: 100 },
    claimedUnits: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED'], default: 'ACTIVE' },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.Deal) {
  delete (mongoose.models as any).Deal;
}

const Deal: Model<IDealDocument> =
  mongoose.models.Deal || mongoose.model<IDealDocument>('Deal', DealSchema);

export default Deal;
