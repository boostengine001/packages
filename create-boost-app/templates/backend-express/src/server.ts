import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { seedInitialData } from './seed';
import { apiRouter } from './routes';
import { securityHeaders, apiRateLimiter } from './middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isMock = process.env.MOCK_MODE !== 'false' && !process.env.MONGODB_URI;

// ── Security & Performance Headers ─────────────────────────────────────────────
app.disable('x-powered-by');
app.use(securityHeaders);

// ── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : process.env.CLIENT_URL
  ? [process.env.CLIENT_URL.trim()]
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? '*' : (origin, callback) => {
      if (!origin || (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin))) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// ── Global Body Parsers ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (Uploads Directory) ───────────────────────────────────────────
const uploadsDirectory = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}
app.use('/uploads', express.static(uploadsDirectory));

// ── Mount MVC API Router with Rate Limiting ────────────────────────────────────
app.use('/api', apiRateLimiter, apiRouter);

// ── Root / Health & API Directory ──────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '⚡ Boost Engine Express eCommerce API (MVC Architecture) is live & ready!',
    status: 'healthy',
    architecture: 'Model-View-Controller (MVC)',
    timestamp: new Date().toISOString(),
    mockMode: isMock,
    mongoConnected: !isMock && !!process.env.MONGODB_URI,
    endpoints: {
      products: {
        list: 'GET /api/products (supports ?category=&search=&sort=&page=&limit=)',
        featured: 'GET /api/products/featured',
        detail: 'GET /api/products/:idOrSlug',
        create: 'POST /api/products (Admin)',
        update: 'PUT /api/products/:id (Admin)',
        delete: 'DELETE /api/products/:id (Admin)',
      },
      categories: {
        list: 'GET /api/categories',
        detail: 'GET /api/categories/:slug',
        create: 'POST /api/categories (Admin)',
        update: 'PUT /api/categories/:id (Admin)',
        delete: 'DELETE /api/categories/:id (Admin)',
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders (supports ?status=&phone=)',
        lookup: 'GET /api/orders/:orderId',
        track: 'POST /api/orders/track',
        updateStatus: 'PATCH /api/orders/:orderId',
      },
      deals: {
        list: 'GET /api/deals',
        create: 'POST /api/deals (Admin)',
        delete: 'DELETE /api/deals/:id (Admin)',
      },
      adBanner: {
        get: 'GET /api/ad-banner',
        update: 'POST /api/ad-banner',
      },
      abandonedCheckout: {
        record: 'POST /api/abandoned-checkout',
        list: 'GET /api/abandoned-checkout',
      },
      notifications: {
        whatsapp: 'POST /api/notifications/whatsapp',
      },
      ai: {
        assistant: 'POST /api/ai/assistant',
      },
      settings: {
        public: 'GET /api/settings',
        admin: 'GET /api/admin/settings (Admin)',
        update: 'PUT /api/admin/settings (Admin)',
      },
      banners: {
        list: 'GET /api/banners',
        create: 'POST /api/banners (Admin)',
        update: 'PUT /api/banners/:id (Admin)',
        delete: 'DELETE /api/banners/:id (Admin)',
      },
      coupons: {
        validate: 'POST /api/coupons/validate (e.g. BOOST20, SAVE20)',
        list: 'GET /api/coupons',
        create: 'POST /api/coupons (Admin)',
        delete: 'DELETE /api/coupons/:id (Admin)',
      },
      reviews: {
        list: 'GET /api/reviews?productId=:id',
        create: 'POST /api/reviews',
      },
      payments: {
        createOrder: 'POST /api/payments/create-order (Rate-limited)',
        verify: 'POST /api/payments/verify',
        webhook: 'POST /api/payments/webhook',
      },
      shipping: {
        pincodeLookup: 'GET /api/shipping/pincode/:pincode',
        createShipment: 'POST /api/shipping/create-shipment',
        trackAwb: 'GET /api/shipping/track/:awb',
      },
      auth: {
        sendOtp: 'POST /api/auth/send-otp (Test OTP: 1234, Rate-limited)',
        verifyOtp: 'POST /api/auth/verify-otp (Rate-limited)',
        login: 'POST /api/auth/login (Rate-limited)',
        register: 'POST /api/auth/register (Rate-limited)',
        me: 'GET /api/auth/me',
      },
      admin: {
        stats: 'GET /api/admin/stats (Admin)',
        upload: 'POST /api/upload or POST /api/admin/upload (Admin)',
        contactQueries: 'GET /api/admin/contact-queries (Admin)',
        subscribers: 'GET /api/admin/subscribers (Admin)',
      },
      support: {
        contact: 'POST /api/contact',
        newsletter: 'POST /api/newsletter/subscribe',
        warrantyRegister: 'POST /api/warranty/register',
        warrantyClaim: 'POST /api/warranty/claim',
        policies: 'GET /api/policies/:type (privacy|terms|refund|shipping)',
      },
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dbConnected: !isMock && !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString(),
  });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ── Start Server & Graceful Shutdown ──────────────────────────────────────────
async function startServer() {
  const db = await connectDB();
  if (db) {
    await seedInitialData();
  }

  const server = app.listen(PORT, () => {
    console.log(`\n\x1b[32m✔ {{BRAND_TITLE}} API (MVC) running on http://localhost:${PORT}\x1b[0m`);
    if (isMock) {
      console.log(`\x1b[33m⚡ MOCK MODE ACTIVE: Zero credentials required. Test OTP: 1234, Coupon: BOOST20\x1b[0m`);
    } else {
      console.log(`\x1b[32m⚡ PRODUCTION/DB MODE ACTIVE with MongoDB\x1b[0m`);
    }
    console.log(`  🛍️  Catalog:    http://localhost:${PORT}/api/products`);
    console.log(`  📂 Categories: http://localhost:${PORT}/api/categories`);
    console.log(`  📦 Orders:     http://localhost:${PORT}/api/orders`);
    console.log(`  🔥 Deals:      http://localhost:${PORT}/api/deals`);
    console.log(`  ⚙️  Settings:   http://localhost:${PORT}/api/settings`);
    console.log(`  🤖 AI Bot:     http://localhost:${PORT}/api/ai/assistant`);
    console.log(`  📊 Admin:      http://localhost:${PORT}/api/admin/stats`);
    console.log(`  🚚 Pincode:    http://localhost:${PORT}/api/shipping/pincode/110001`);
    console.log(`  💳 Payments:   http://localhost:${PORT}/api/payments/create-order\n`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n\x1b[33m[Server] Received ${signal}. Starting graceful shutdown...\x1b[0m`);
    server.close(async () => {
      console.log('\x1b[32m[Server] HTTP server closed.\x1b[0m');
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('\x1b[32m[Server] MongoDB connection closed.\x1b[0m');
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error('\x1b[31m[Server] Forced shutdown after 10s timeout.\x1b[0m');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
