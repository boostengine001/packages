import { Request, Response } from 'express';

export const sendWhatsAppNotification = (req: Request, res: Response) => {
  try {
    const { type, phone, customerName, orderId, orderNumber, cartItems, totalAmount, trackingUrl } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    let messageText = '';

    if (type === 'abandoned_cart') {
      const itemsList = (cartItems || [])
        .map((i: any) => `• ${i.title} (x${i.quantity || 1})`)
        .join('\n');
      messageText = `Hey ${customerName || 'there'}! 👋 We noticed you left items in your shopping bag:\n\n${itemsList}\n\nUse code *BOOST20* to get an EXTRA 20% OFF if you complete your order now! 🎁\n\n👉 Complete Checkout: https://boostengine.store/checkout`;
    } else if (type === 'order_confirmed') {
      messageText = `Hi ${customerName || 'Customer'}! 🎉 Your order #${orderNumber || orderId} of ₹${totalAmount} has been confirmed!\n\nWe are preparing your items for dispatch. 📦\n\n👉 Track live: https://boostengine.store/orders/${orderId}/track\n\nThank you for shopping with us!`;
    } else if (type === 'out_for_delivery') {
      messageText = `🚚 Out for Delivery: Your order #${orderNumber || orderId} is arriving today!\n\nKeep your phone handy. Track delivery partner: ${trackingUrl || `https://boostengine.store/orders/${orderId}/track`}`;
    } else {
      messageText = `Hello from Boost Store! How can we assist you today?`;
    }

    const directWaUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    return res.json({
      success: true,
      data: {
        dispatched: true,
        channel: 'whatsapp',
        phone: cleanPhone,
        message: messageText,
        directWaUrl,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
