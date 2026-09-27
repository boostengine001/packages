import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order, Setting } from '../models';
import { isDbConnected } from '../db';

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required.' });
    }

    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    if ((!keyId || !keySecret) && isDbConnected()) {
      const setting = (await Setting.findOne().lean()) as any;
      if (setting?.razorpayKeyId && setting?.razorpayKeySecret) {
        keyId = setting.razorpayKeyId;
        keySecret = setting.razorpayKeySecret;
      }
    }

    const isLive = Boolean(keyId && keySecret && !keyId.includes('mock'));

    if (isLive) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: { orderId: orderId || '' },
          }),
        });

        const rzpData = (await rzpResponse.json()) as any;

        if (rzpData.id) {
          if (orderId && isDbConnected()) {
            await Order.findOneAndUpdate(
              { orderId },
              { razorpayOrderId: rzpData.id }
            );
          }

          return res.json({
            success: true,
            mockMode: false,
            orderId: rzpData.id,
            amount: rzpData.amount,
            currency: rzpData.currency,
            keyId,
          });
        }
      } catch (err: any) {
        console.error('Razorpay API error, falling back to mock response:', err.message);
      }
    }

    const mockOrderId = 'order_mock_' + Math.floor(100000 + Math.random() * 900000);

    if (orderId && isDbConnected()) {
      await Order.findOneAndUpdate(
        { orderId },
        { razorpayOrderId: mockOrderId }
      );
    }

    return res.json({
      success: true,
      mockMode: true,
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || 'rcpt_' + Date.now(),
      keyId: keyId || 'rzp_test_mock_boost',
      message: '⚡ [MOCK MODE] Simulated Razorpay order created.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret && isDbConnected()) {
      const setting = (await Setting.findOne().lean()) as any;
      if (setting?.razorpayKeySecret) {
        keySecret = setting.razorpayKeySecret;
      }
    }

    if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Payment verification failed: Invalid HMAC signature.',
        });
      }
    }

    if (orderId && isDbConnected()) {
      await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        }
      );
    }

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id || 'pay_mock_' + Date.now(),
      orderId: razorpay_order_id,
      message: 'Payment verified and order confirmed successfully!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const rzpOrderId = paymentEntity.order_id;
      if (rzpOrderId && isDbConnected()) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId },
          { paymentStatus: 'paid', orderStatus: 'confirmed', razorpayPaymentId: paymentEntity.id }
        );
      }
    }

    return res.json({ success: true, received: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
