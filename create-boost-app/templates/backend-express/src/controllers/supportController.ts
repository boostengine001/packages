import { Request, Response } from 'express';
import { ContactQuery, Subscriber, Setting } from '../models';
import { isDbConnected } from '../db';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    if (isDbConnected()) {
      const created = await ContactQuery.create({
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        status: 'new',
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your query has been recorded and our team will get in touch shortly.',
        ticketId: 'TKT-' + created._id.toString().slice(-6).toUpperCase(),
      });
    }

    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    return res.json({
      success: true,
      message: 'Thank you for reaching out! Our team will respond within 24 hours.',
      ticketId,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (isDbConnected()) {
      await Subscriber.findOneAndUpdate(
        { email: cleanEmail },
        { email: cleanEmail, isActive: true },
        { upsert: true }
      );
    }

    return res.json({
      success: true,
      message: 'Thank you for subscribing! Check your inbox for exclusive perks.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const registerWarranty = (req: Request, res: Response) => {
  const { fullName, email, orderNumber, productPurchased } = req.body || {};
  if (!fullName || !email || !orderNumber) {
    return res.status(400).json({ success: false, error: 'Full name, email, and order number are required.' });
  }

  return res.json({
    success: true,
    registrationId: 'WR-' + Date.now().toString().slice(-8),
    message: 'Warranty registered for ' + (productPurchased || 'your product') + '!',
  });
};

export const claimWarranty = (req: Request, res: Response) => {
  const { fullName, email, orderNumber, issueDescription } = req.body || {};
  if (!fullName || !email || !orderNumber || !issueDescription) {
    return res.status(400).json({ success: false, error: 'Please provide full details and issue description.' });
  }

  return res.json({
    success: true,
    claimId: 'CLM-' + Date.now().toString().slice(-8),
    message: 'Warranty claim received. Our inspection team will contact you within 24-48 hours.',
  });
};

export const getPolicy = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const brand = process.env.BUSINESS_NAME || 'Boost D2C Store';

    if (isDbConnected()) {
      const setting = (await Setting.findOne().lean()) as any;
      if (setting) {
        const policyKeyMap: Record<string, string> = {
          privacy: setting.privacyPolicy,
          terms: setting.termsAndConditions,
          refund: setting.refundPolicy,
          shipping: setting.shippingPolicy,
        };
        const content = policyKeyMap[type.toLowerCase()];
        if (content) {
          return res.json({
            success: true,
            title: type.toUpperCase() + ' Policy',
            content,
          });
        }
      }
    }

    const defaultPolicies: Record<string, { title: string; content: string }> = {
      privacy: {
        title: 'Privacy Policy',
        content: `${brand} respects your privacy. We strictly collect only essential customer information required for shipping logistics and Indian GST invoice compliance.`,
      },
      terms: {
        title: 'Terms of Service',
        content: `By purchasing from ${brand}, you agree that all sales and transactions are governed under Indian consumer protection and e-commerce compliance regulations.`,
      },
      refund: {
        title: 'Return & Refund Policy',
        content: `We offer a 7-day doorstep replacement or exchange for damaged, defective, or mis-sized items.`,
      },
      shipping: {
        title: 'Shipping Policy',
        content: `Orders placed before 2 PM are dispatched same-day. Estimated delivery timeline is 2-4 business days across India.`,
      },
    };

    const policy = defaultPolicies[type.toLowerCase()];
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    return res.json({ success: true, ...policy });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
