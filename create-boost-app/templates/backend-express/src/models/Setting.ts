import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISocials {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface IAppearanceConfig {
  background?: string;
  surface?: string;
  textPrimary?: string;
  textSecondary?: string;
  primary?: string;
  buttonPrimaryBg?: string;
  buttonPrimaryText?: string;
  buttonOutline?: string;
  border?: string;
  shadow?: string;
}

export interface ISettings extends Document {
  storeName: string;
  contactEmail: string;
  storeAddress: string;
  phone?: string;
  whatsapp?: string;
  socials?: ISocials;
  theme: 'light' | 'dark' | 'system';
  font: string;
  logoUrl: string;
  footerDescription?: string;
  primaryColor: string;
  primaryColorDark: string;
  appearance?: {
    light?: IAppearanceConfig;
    dark?: IAppearanceConfig;
  };
  privacyPolicy?: string;
  termsAndConditions?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  isCodEnabled?: boolean;
  isRazorpayEnabled?: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  isPhonePeEnabled?: boolean;
  phonepeMerchantId?: string;
  phonepeSaltKey?: string;
  isCashfreeEnabled?: boolean;
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  freeShippingThreshold?: number;
  defaultShippingFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialsSchema = new Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { _id: false }
);

const AppearanceSchema = new Schema(
  {
    background: { type: String },
    surface: { type: String },
    textPrimary: { type: String },
    textSecondary: { type: String },
    primary: { type: String },
    buttonPrimaryBg: { type: String },
    buttonPrimaryText: { type: String },
    buttonOutline: { type: String },
    border: { type: String },
    shadow: { type: String },
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: 'Boost E-Commerce Store' },
    contactEmail: { type: String, default: 'support@example.com' },
    storeAddress: { type: String, default: '123 Market Street, New Delhi, India' },
    phone: { type: String, default: '+91 98765 43210' },
    whatsapp: { type: String, default: '+91 98765 43210' },
    socials: { type: SocialsSchema, default: () => ({}) },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    font: { type: String, default: 'inter' },
    primaryColor: { type: String, default: '#6366f1' },
    primaryColorDark: { type: String, default: '#4f46e5' },
    appearance: {
      light: { type: AppearanceSchema, default: () => ({}) },
      dark: { type: AppearanceSchema, default: () => ({}) },
    },
    logoUrl: { type: String, default: '' },
    footerDescription: {
      type: String,
      default: 'Premium direct-to-consumer digital commerce powered by Boost Engine.',
    },
    privacyPolicy: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    refundPolicy: { type: String, default: '' },
    shippingPolicy: { type: String, default: '' },
    isCodEnabled: { type: Boolean, default: true },
    isRazorpayEnabled: { type: Boolean, default: true },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    isPhonePeEnabled: { type: Boolean, default: false },
    phonepeMerchantId: { type: String, default: '' },
    phonepeSaltKey: { type: String, default: '' },
    isCashfreeEnabled: { type: Boolean, default: false },
    cashfreeAppId: { type: String, default: '' },
    cashfreeSecretKey: { type: String, default: '' },
    freeShippingThreshold: { type: Number, default: 999 },
    defaultShippingFee: { type: Number, default: 79 },
  },
  { timestamps: true }
);

export default models.Setting || model<ISettings>('Setting', SettingsSchema);
