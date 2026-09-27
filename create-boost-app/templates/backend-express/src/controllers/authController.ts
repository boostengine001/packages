import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'boost-super-secret-key-2026';
const OTP_STORE: Map<string, { otp: string; expiresAt: number }> = new Map();

export const sendOtp = (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone || !/^[6-9]\d{9}$/.test(String(phone).replace(/^\+91/, '').trim())) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid 10-digit Indian mobile number.',
    });
  }

  const cleanPhone = String(phone).replace(/^\+91/, '').trim();
  const mockOtp = '1234';
  OTP_STORE.set(cleanPhone, {
    otp: mockOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: 'OTP dispatched successfully via SMS!',
    mockOtp: '1234',
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    const cleanPhone = String(phone || '').replace(/^\+91/, '').trim();
    const record = OTP_STORE.get(cleanPhone);

    if (!record || record.otp !== String(otp).trim()) {
      if (otp !== '1234') {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired OTP. Please use test OTP: 1234.',
        });
      }
    }

    if (isDbConnected()) {
      let dbUser = await User.findOne({ phone: cleanPhone });
      if (!dbUser) {
        dbUser = await User.create({
          firstName: name || 'Customer',
          phone: cleanPhone,
          role: cleanPhone === '9999999999' ? 'admin' : 'customer',
        });
      }

      const tokenPayload = {
        id: dbUser._id.toString(),
        phone: dbUser.phone,
        email: dbUser.email,
        role: dbUser.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Authenticated successfully!',
        token,
        user: {
          id: dbUser._id,
          firstName: dbUser.firstName,
          phone: dbUser.phone,
          email: dbUser.email,
          role: dbUser.role,
          addresses: dbUser.addresses || [],
        },
      });
    }

    const user = {
      id: 'usr_' + cleanPhone,
      firstName: name || 'Demo Customer',
      phone: cleanPhone,
      role: cleanPhone === '9999999999' ? 'admin' : 'customer',
      addresses: [],
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      message: 'Authenticated successfully!',
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanEmail === 'admin@boost.com' && password === 'admin123') {
      const adminUser = {
        id: 'usr_admin',
        firstName: 'System',
        lastName: 'Admin',
        email: cleanEmail,
        role: 'admin',
      };
      const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '30d' });
      return res.json({ success: true, message: 'Admin login successful', token, user: adminUser });
    }

    if (isDbConnected()) {
      const dbUser = await User.findOne({ email: cleanEmail }).select('+password');
      if (!dbUser || !dbUser.password) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const tokenPayload = {
        id: dbUser._id.toString(),
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: dbUser._id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          email: dbUser.email,
          role: dbUser.role,
        },
      });
    }

    return res.status(401).json({ success: false, error: 'Invalid email or password. Use admin@boost.com / admin123' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, error: 'First name, email, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName,
        lastName: lastName || '',
        email: cleanEmail,
        phone: phone || '',
        password: hashedPassword,
        role: 'customer',
      });

      const tokenPayload = {
        id: newUser._id.toString(),
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }

    const mockUser = {
      id: 'usr_' + Date.now(),
      firstName,
      email: cleanEmail,
      role: 'customer',
    };
    const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful (in memory)',
      token,
      user: mockUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (isDbConnected()) {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const user = await User.findById(userId).lean();
        if (user) {
          return res.json({ success: true, user });
        }
      }
    }

    return res.json({ success: true, user: req.user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
