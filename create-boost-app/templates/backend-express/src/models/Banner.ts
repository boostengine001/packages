import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBannerDocument extends Document {
  title?: string;
  image: string;
  mobileImage?: string;
  desktopOrder: number;
  mobileOrder: number;
  link: string;
  buttonText?: string;
  isActive: boolean;
  orientation: 'landscape' | 'portrait';
  isHeroBanner?: boolean;
  isNewArrival?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IBanner = IBannerDocument;

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, trim: true, default: '' },
    image: { type: String, required: true },
    mobileImage: { type: String, default: '' },
    desktopOrder: { type: Number, default: 0, index: true },
    mobileOrder: { type: Number, default: 0, index: true },
    link: { type: String, default: '/shop', trim: true },
    buttonText: { type: String, default: 'Shop Now', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    orientation: { type: String, enum: ['landscape', 'portrait'], default: 'landscape' },
    isHeroBanner: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Banner: Model<IBannerDocument> =
  mongoose.models.Banner || mongoose.model<IBannerDocument>('Banner', BannerSchema);

export default Banner;
