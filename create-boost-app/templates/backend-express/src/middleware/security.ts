import { Request, Response, NextFunction } from 'express';

/**
 * Production Security Headers Middleware
 * Protects against XSS, clickjacking, MIME-sniffing, and information leakage.
 * Replaces heavy dependencies like helmet with zero runtime overhead.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent browser from MIME-sniffing away from declared Content-Type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking by restricting framing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Modern browsers standard for XSS Protection header (disables legacy buggy filter)
  res.setHeader('X-XSS-Protection', '0');

  // Protect referrer info when navigating across origins
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Allow cross-origin media loading (e.g. Next.js image optimizer loading from Express /uploads)
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // Restrict sensitive browser APIs if accessed in browser context
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // If running over HTTPS in production, enforce HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
