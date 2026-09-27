import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { Order, Coupon, Product } from '../models';
import { isDbConnected } from '../db';
import { computeIndianGst } from '../utils/gst';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  gstRate?: number;
}

export interface OrderData {
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
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  gst: {
    taxType: 'INTRA_STATE' | 'INTER_STATE';
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'cod_pending' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

const ORDERS_DB: Map<string, OrderData> = new Map([
  [
    'ORD-892104',
    {
      orderId: 'ORD-892104',
      customer: {
        name: 'Kabir Verma',
        phone: '+91 98765 43210',
        email: 'kabir.v@example.com',
        address: 'Flat 402, Signature Towers, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
      items: [
        {
          productId: 'prod_1',
          title: 'Cyberpunk Heavyweight 450 GSM Hoodie',
          price: 2499,
          quantity: 1,
          selectedSize: 'L',
          selectedColor: 'Onyx Black',
          gstRate: 18,
        },
      ],
      subtotal: 2499,
      discount: 0,
      shippingFee: 0,
      gst: {
        taxType: 'INTER_STATE',
        cgst: 0,
        sgst: 0,
        igst: 381,
        totalGst: 381,
      },
      totalAmount: 2499,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'dispatched',
      trackingNumber: 'DEL-99281726',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
]);

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, phone, limit = '50', page = '1' } = req.query;

    const isMock = process.env.MOCK_MODE !== 'false' && !process.env.MONGODB_URI;
    const isAdmin = req.user?.role === 'admin' || isMock;

    // Require phone query for customer lookup or admin auth for global order list
    if (!phone && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Phone number or admin authorization required to query order history',
      });
    }

    if (isDbConnected()) {
      const query: any = {};
      if (status) query.orderStatus = status;
      if (phone) query['customer.phone'] = { $regex: String(phone).replace(/\D/g, '') };

      const l = parseInt(String(limit), 10) || 50;
      const p = parseInt(String(page), 10) || 1;

      const [orders, total] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
        Order.countDocuments(query),
      ]);

      if (orders.length > 0 || total > 0) {
        return res.json({
          success: true,
          count: orders.length,
          total,
          orders,
        });
      }
    }

    let ordersList = Array.from(ORDERS_DB.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (status) {
      ordersList = ordersList.filter((o) => o.orderStatus === status);
    }

    if (phone) {
      const qPhone = String(phone).replace(/\D/g, '');
      ordersList = ordersList.filter((o) => o.customer.phone.replace(/\D/g, '').includes(qPhone));
    }

    return res.json({
      success: true,
      count: ordersList.length,
      orders: ordersList,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, items, paymentMethod = 'online', couponCode } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, phone, address, and pincode are required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order items cannot be empty.' });
    }

    const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

    let discount = 0;
    if (couponCode) {
      const upper = String(couponCode).trim().toUpperCase();
      if (isDbConnected()) {
        const dbCoupon = await Coupon.findOne({ code: upper, isActive: true });
        if (dbCoupon && new Date() <= dbCoupon.expiryDate) {
          if (!dbCoupon.minSpend || subtotal >= dbCoupon.minSpend) {
            discount = dbCoupon.type === 'percentage' ? Math.round(subtotal * (dbCoupon.value / 100)) : dbCoupon.value;
          }
        }
      }
      if (discount === 0) {
        if (upper === 'BOOST20' || upper === 'SAVE20') discount = Math.round(subtotal * 0.2);
        else if (upper === 'WELCOME10') discount = Math.round(subtotal * 0.1);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const shippingFee = taxableAmount >= 999 ? 0 : 79;
    const gstBreakdown = computeIndianGst(taxableAmount, customer.state || 'DL');
    const totalAmount = taxableAmount + shippingFee;

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = 'TRK-' + Date.now().toString().slice(-8);

    if (isDbConnected()) {
      const createdOrder = await Order.create({
        orderId,
        customer,
        items,
        subtotal,
        discount,
        couponCode,
        shippingFee,
        gst: gstBreakdown,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod.toLowerCase() === 'cod' ? 'cod_pending' : 'paid',
        orderStatus: 'placed',
        trackingNumber,
        carrier: 'Delhivery Surface',
      });

      // Deduct inventory stock for ordered items
      for (const item of items) {
        if (item.productId) {
          const isObjectId = mongoose.Types.ObjectId.isValid(item.productId);
          await Product.findOneAndUpdate(
            {
              $or: [
                ...(isObjectId ? [{ _id: item.productId }] : []),
                { id: item.productId },
                { slug: item.productId },
              ],
            },
            {
              $inc: { stockQuantity: -Math.max(1, item.quantity || 1) },
            }
          ).catch((err) => {
            console.error('[OrderController] Stock decrement error for item:', item.productId, err);
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully in database!',
        order: createdOrder,
      });
    }

    const newOrder: OrderData = {
      orderId,
      customer,
      items,
      subtotal,
      discount,
      shippingFee,
      gst: gstBreakdown,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'paid',
      orderStatus: 'placed',
      trackingNumber,
      createdAt: new Date().toISOString(),
    };

    ORDERS_DB.set(orderId, newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (isDbConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);

      const dbOrder = await Order.findOne({
        $or: [
          { orderId },
          ...(isObjectId ? [{ _id: orderId }] : []),
        ],
      }).lean();

      if (dbOrder) {
        return res.json({ success: true, order: dbOrder });
      }
    }

    const order = ORDERS_DB.get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, phone } = req.body;
    if (!orderId || !phone) {
      return res.status(400).json({ success: false, error: 'Order ID and Phone number are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    if (isDbConnected()) {
      const order = await Order.findOne({
        orderId: String(orderId).trim().toUpperCase(),
        'customer.phone': { $regex: cleanPhone },
      }).lean();

      if (order) {
        return res.json({ success: true, order });
      }
    }

    const memOrder = ORDERS_DB.get(String(orderId).trim().toUpperCase());
    if (memOrder && memOrder.customer.phone.replace(/\D/g, '').includes(cleanPhone)) {
      return res.json({ success: true, order: memOrder });
    }

    return res.status(404).json({ success: false, error: 'No order found matching this Order ID and phone number' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, carrier } = req.body;

    if (isDbConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);

      const updated = await Order.findOneAndUpdate(
        { $or: [{ orderId }, ...(isObjectId ? [{ _id: orderId }] : [])] },
        { $set: { ...(orderStatus && { orderStatus }), ...(paymentStatus && { paymentStatus }), ...(trackingNumber && { trackingNumber }), ...(carrier && { carrier }) } },
        { new: true }
      );

      if (updated) {
        return res.json({ success: true, message: 'Order updated successfully in database', order: updated });
      }
    }

    const order = ORDERS_DB.get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    ORDERS_DB.set(orderId, order);
    return res.json({ success: true, message: 'Order updated successfully in memory', order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
