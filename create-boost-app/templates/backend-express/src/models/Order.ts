import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  gstRate?: number;
  hsnCode?: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  gst?: {
    taxType: 'INTRA_STATE' | 'INTER_STATE';
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
  };
  totalAmount: number;
  paymentMethod: 'online' | 'cod' | 'Razorpay' | 'Cashfree' | 'PhonePe';
  paymentStatus: 'pending' | 'paid' | 'cod_pending' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | 'return_requested';
  trackingNumber?: string;
  carrier?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        selectedSize: { type: String },
        selectedColor: { type: String },
        gstRate: { type: Number, default: 18 },
        hsnCode: { type: String, default: '6109' },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingFee: { type: Number, default: 0 },
    gst: {
      taxType: { type: String, enum: ['INTRA_STATE', 'INTER_STATE'], default: 'INTRA_STATE' },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      totalGst: { type: Number, default: 0 },
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'online' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cod_pending', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'dispatched', 'delivered', 'cancelled', 'return_requested'],
      default: 'placed',
    },
    trackingNumber: { type: String },
    carrier: { type: String, default: 'Delhivery Surface' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>('Order', OrderSchema);
