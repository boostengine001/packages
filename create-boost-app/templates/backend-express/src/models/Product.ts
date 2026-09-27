import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IVariant {
  sku: string;
  title?: string;
  price: number;
  compareAtPrice?: number;
  size?: string;
  color?: string;
  stock: number;
  image?: string;
}

export interface IProduct extends Document {
  title: string;
  name?: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand?: string;
  image: string;
  images: string[];
  description: string;
  shortDescription?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity?: number;
  hsn?: string;
  gstRate?: number;
  sizes: string[];
  colors: string[];
  variants?: IVariant[];
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    title: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 10 },
    image: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: '' },
    image: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 50 },
    hsn: { type: String, default: '6109' },
    gstRate: { type: Number, default: 18 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    variants: [VariantSchema],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', category: 'text' });

export default models.Product || model<IProduct>('Product', ProductSchema);
