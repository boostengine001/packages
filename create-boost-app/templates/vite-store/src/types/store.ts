import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  days: string;
  serviceable: boolean;
  codAvailable: boolean;
  estimatedDays: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
}

export interface IndianGstBreakdown {
  taxType: 'INTRA_STATE' | 'INTER_STATE';
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
}

export interface PlacedOrder {
  orderId: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  gst?: IndianGstBreakdown;
  totalAmount: number;
  paymentMethod: 'online' | 'cod' | 'Razorpay' | 'Cashfree' | 'PhonePe';
  paymentStatus: 'paid' | 'pending' | 'cod_pending' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | 'processing' | 'shipped';
  trackingNumber?: string;
  courierName?: string;
  carrier?: string;
  courierPartner?: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  type?: 'percentage' | 'fixed';
  discountPercent?: number;
  value?: number;
  minOrderAmount?: number;
  minSpend?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  isActive?: boolean;
}

export interface StoreSocials {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline?: string;
  logoUrl?: string;
  supportEmail: string;
  supportPhone: string;
  contactEmail?: string;
  phone?: string;
  whatsapp?: string;
  storeAddress?: string;
  gstin?: string;
  socials?: StoreSocials;
  theme?: 'light' | 'dark' | 'system';
  font?: string;
  primaryColor?: string;
  primaryColorDark?: string;
  footerDescription?: string;
  privacyPolicy?: string;
  termsAndConditions?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  defaultShippingFee?: number;
  enableCod: boolean;
  isCodEnabled?: boolean;
  isRazorpayEnabled?: boolean;
  razorpayKeyId?: string;
}

