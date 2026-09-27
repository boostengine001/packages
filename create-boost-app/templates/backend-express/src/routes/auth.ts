import { Router } from 'express';
import * as authController from '../controllers/authController';
import { verifyAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate, rules } from '../middleware/validator';

export const authRouter = Router();

// Protect auth endpoints against automated spam & validate body payloads
authRouter.post(
  '/send-otp',
  authRateLimiter,
  validate({
    body: {
      phone: [rules.required('Phone number'), rules.indianPhone('Phone number')],
    },
  }),
  authController.sendOtp
);

authRouter.post(
  '/verify-otp',
  authRateLimiter,
  validate({
    body: {
      phone: [rules.required('Phone number'), rules.indianPhone('Phone number')],
      otp: [rules.required('OTP'), rules.minLength(4, 'OTP')],
    },
  }),
  authController.verifyOtp
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({
    body: {
      email: [rules.required('Email'), rules.email('Email')],
      password: [rules.required('Password'), rules.minLength(6, 'Password')],
    },
  }),
  authController.login
);

authRouter.post(
  '/register',
  authRateLimiter,
  validate({
    body: {
      email: [rules.required('Email'), rules.email('Email')],
      password: [rules.required('Password'), rules.minLength(6, 'Password')],
      firstName: [rules.required('First name'), rules.string('First name')],
    },
  }),
  authController.register
);

authRouter.get('/me', verifyAuth, authController.getMe);
