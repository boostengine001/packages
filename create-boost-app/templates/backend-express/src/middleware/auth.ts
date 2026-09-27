import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone?: string;
    email?: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'boost-super-secret-key-2026';

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'boost-super-secret-key-2026')
) {
  console.warn(
    '\x1b[31m[SECURITY WARNING] Using default JWT_SECRET in production! Please define a strong JWT_SECRET in .env\x1b[0m'
  );
}

export function verifyAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const isMock = process.env.MOCK_MODE !== 'false' && !process.env.MONGODB_URI;
  const authHeader = req.headers.authorization;

  // In production or when an auth token is provided, strictly enforce verification
  if (!isMock || authHeader) {
    return verifyAuth(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin privilege required' });
      }
      return next();
    });
  }

  // In zero-config local development/mock mode without token, allow mock admin for seamless template DX
  req.user = {
    id: 'usr_mock_admin',
    role: 'admin',
    email: 'admin@boost.com',
  };
  return next();
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  return next();
}
