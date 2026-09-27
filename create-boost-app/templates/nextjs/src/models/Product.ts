// Cache reload trigger comment
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';
import { ICategory } from './Category';
import { ITag } from './Tag';

export interface IProductMedia {
  type: 'image' | 'video';
  url: string;
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
}

export interface IVariant {
  name?: string;
  sku: string;
  options: { name: string; value: string }[];
  price: number;
  salePrice?: number;
  stock: number;
  weight?: number;
  dimensions?: IDimensions;
  images?: string[];
  categories?: (Types.ObjectId | ICategory | string)[];
  easyecomProductId?: string;
  easyecomSynced?: boolean;
}

export interface IFeatureBanner {
  image: string;
  displayOrder?: number;
}

export interface IUpsellItem {
  product: Types.ObjectId | IProduct | string;
  variantSku?: string;
  discountType?: 'percentage' | 'fixed_price';
  discountValue?: number;
}

export interface IProduct extends Document {
  _id: any;
  id?: string;
  title?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  compareAtPrice?: number;
  category: any;
  images?: string[];
  image?: string;
  media: IProductMedia[];
  variants: IVariant[];
  dimensions?: IDimensions;
  weight?: number;
  inStock?: boolean;
  isActive: boolean;
  isDeleted?: boolean;
  publishDate?: Date;
  averageRating: number;
  numReviews: number;
  rating?: { value: number; count: number };
  reviews?: any[];
  highlights?: string[];
  tags?: any[];
  showMeasurements?: boolean;
  measurementChart?: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  warrantyYears?: number;
  ean?: string;
  returnMessage?: string;
  gstRate?: number;
  taxRate?: number;
  hsnCode?: string;
  sku?: string;
  upsellProducts?: any[];
  upsellItems?: IUpsellItem[];
  checkoutDealConfig?: Partial<IUpsellItem> | null;
  youtubeUrl?: string;
  featureBanners?: IFeatureBanner[];
  displayOrder: number;
  easyecomProductId?: string;
  easyecomSynced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductMediaSchema: Schema = new Schema({
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
});

const DimensionsSchema: Schema = new Schema({
  length: { type: Number, default: 0, min: 0 },
  width: { type: Number, default: 0, min: 0 },
  height: { type: Number, default: 0, min: 0 }
}, { _id: false });

const VariantSchema: Schema = new Schema({
  id: { type: String },
  name: { type: String, trim: true },
  title: { type: String, trim: true },
  sku: { type: String, required: true },
  options: { type: [Schema.Types.Mixed], default: [] },
  attributes: { type: Schema.Types.Mixed },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  weight: { type: Number, min: 0 },
  dimensions: DimensionsSchema,
  images: { type: [String], default: [] },
  image: { type: String },
  categories: { type: [Schema.Types.Mixed], default: [] },
  easyecomProductId: { type: String, default: null },
  easyecomSynced: { type: Boolean, default: false },
}, { _id: false });

const ProductSchema: Schema = new Schema({
  id: { type: String, index: true },
  title: { type: String, trim: true },
  name: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '', trim: true },
  shortDescription: { type: String, trim: true, default: '' },
  brand: { type: String, trim: true, default: 'Boost Brand' },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  category: { type: Schema.Types.Mixed, required: true },
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  media: { type: [ProductMediaSchema], default: [] },
  variants: { type: [VariantSchema], default: [] },
  dimensions: DimensionsSchema,
  weight: { type: Number, default: 0, min: 0 },
  inStock: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false, index: true },
  publishDate: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 12 },
  rating: { type: Schema.Types.Mixed, default: { value: 4.8, count: 12 } },
  reviews: { type: [Schema.Types.Mixed], default: [] },
  highlights: { type: [String], default: [] },
  tags: { type: [Schema.Types.Mixed], default: [] },
  showMeasurements: { type: Boolean, default: false },
  measurementChart: { type: String, default: null },
  isBestSeller: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false, index: true },
  warrantyYears: { type: Number, default: 0, min: 0 },
  ean: { type: String, trim: true, default: '' },
  returnMessage: { type: String, trim: true, default: '' },
  gstRate: { type: Number, default: 18 },
  taxRate: { type: Number, default: 18 },
  hsnCode: { type: String, trim: true, default: '6109' },
  sku: { type: String, trim: true },
  upsellProducts: { type: [Schema.Types.Mixed], default: [] },
  upsellItems: [{
    _id: false,
    product: { type: Schema.Types.Mixed },
    variantSku: { type: String, trim: true, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed_price'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },
  }],
  youtubeUrl: { type: String, trim: true, default: '' },
  featureBanners: [{
    image: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 }
  }],
  displayOrder: { type: Number, default: 0, index: true },
  easyecomProductId: { type: String, default: null },
  easyecomSynced: { type: Boolean, default: false },
}, { timestamps: true });

ProductSchema.index({ isActive: 1, isDeleted: 1, createdAt: -1 });

ProductSchema.pre('validate', function (this: any, next: any) {
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.id) {
    this.id = this._id ? this._id.toString() : `prod_${Date.now()}`;
  }
  if (!this.slug) {
    const raw = this.title || this.name || 'product';
    this.slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;
  }
  if (typeof next === 'function') next();
});

ProductSchema.pre('save', function (this: any, next: any) {
  if (this.isModified('salePrice') && this.salePrice && this.price) {
    if (this.salePrice > this.price) {
      return next ? next(new Error('Sale price must be less than or equal to the regular price.')) : undefined;
    }
  }
  if (typeof next === 'function') next();
});

if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as any).Product;
}
export default models.Product || model<IProduct>('Product', ProductSchema);
