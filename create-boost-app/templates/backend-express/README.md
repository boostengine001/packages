# ⚡ Boost Engine Express eCommerce API

A production-grade, highly performant **Node.js / Express REST API** tailored for Indian D2C eCommerce brands, mobile apps (React Native / Expo / Flutter), and modern web storefronts.

---

## 🌟 Key Capabilities

- **Dual-Mode Execution**:
  - **Zero-Setup Mock Mode**: Immediate out-of-the-box local testing without requiring MongoDB or API keys. Test OTP (`1234`), simulated Razorpay orders, and in-memory catalog.
  - **Full Production MongoDB Mode**: When `MONGODB_URI` is provided, automatically establishes resilient connection pooling and auto-seeds initial products, categories, and settings.
- **Indian GST Engine**: Intra-state (CGST 9% + SGST 9%) vs Inter-state (IGST 18%) automatic tax calculation.
- **Indian Pincode & Logistics**: Serviceability check across all Indian states and Tier 1/2/3 cities with Delhivery & Shiprocket compatibility.
- **Payment Gateway Architecture**:
  - Direct HTTPS Razorpay order generation & cryptographic HMAC SHA256 signature verification.
  - Webhook listener for automatic order state transitions (`payment.captured`).
  - Cash on Delivery (COD) flow with tracking.
- **Authentication**: Indian 10-digit mobile number OTP authentication + Admin email/password login with JWT.
- **Auto Image Optimization & Compression**: Automatically converts uploaded 4K/mobile phone camera photos into next-gen **WebP** format and downscales large resolutions (70-85% size savings) to guarantee blazing fast page load speed and high PageSpeed/LCP scores.
- **Full Admin Suite**: Dashboard analytics, product management, order fulfillment, banners, coupon management, and media uploads.

---

## 🏛️ Architecture: Model-View-Controller (MVC)

```text
src/
├── controllers/          # Business logic, database queries, and response handlers
│   ├── productController.ts
│   ├── orderController.ts
│   ├── categoryController.ts
│   ├── paymentController.ts
│   ├── ... (17 controllers)
│   └── index.ts
├── models/               # Mongoose Schemas and TypeScript interfaces
│   ├── Product.ts
│   ├── Order.ts
│   ├── Category.ts
│   ├── Setting.ts
│   ├── ... (13 models)
│   └── index.ts
├── routes/               # Thin HTTP routing definitions mapping to controllers
│   ├── products.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── ... (17 routers)
│   └── index.ts
├── middleware/           # JWT verification, Admin guards, Rate limiting, Security headers, Request validation
│   ├── auth.ts
│   ├── rateLimiter.ts
│   ├── security.ts
│   ├── validator.ts
│   └── index.ts
├── utils/                # Indian GST tax computations, Pincode lookup, Image optimizer
│   ├── gst.ts
│   ├── imageOptimizer.ts
│   └── pincodes.ts
├── db.ts                 # Resilient MongoDB pooling & status check
├── seed.ts               # Auto-seeder on first database connection
└── server.ts             # Express server setup, CORS, Security headers & Graceful shutdown
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Default settings run in instant mock mode with zero credentials required).*

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3001`.

### 4. Run Complete Test Suite
```bash
npm test
```
Executes the comprehensive automated test suite covering all Utilities (GST, Pincodes, Image compression), Middlewares (Rate limiters, Security headers, Schema validators), and End-to-End HTTP API routes.

---

## 📡 API Endpoints Directory

### 🛍️ Products (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (supports `?category=`, `?search=`, `?sort=`, `?page=`, `?limit=`) |
| `GET` | `/api/products/featured` | Fetch featured hero products |
| `GET` | `/api/products/:idOrSlug` | Product details by ID or URL slug |
| `POST` | `/api/products` | Create product *(Admin)* |
| `PUT` | `/api/products/:id` | Update product *(Admin)* |
| `DELETE` | `/api/products/:id` | Delete product *(Admin)* |

### 📂 Categories (`/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List active categories |
| `GET` | `/api/categories/:slug` | Category by slug |
| `POST` | `/api/categories` | Create category *(Admin)* |
| `PUT` | `/api/categories/:id` | Update category *(Admin)* |
| `DELETE` | `/api/categories/:id` | Delete category *(Admin)* |

### 📦 Orders & Tracking (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Create new order (calculates GST & applies coupons) |
| `GET` | `/api/orders` | List orders (supports `?status=`, `?phone=`) |
| `GET` | `/api/orders/:orderId` | Order lookup by `orderId` or `_id` |
| `POST` | `/api/orders/track` | Customer order tracking by phone + Order ID |
| `PATCH` | `/api/orders/:orderId` | Update fulfillment & payment status *(Admin)* |

### ⚙️ Store Settings (`/api/settings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Public store settings (Theme, Logo, Payment flags, Policies) |
| `GET` | `/api/admin/settings` | Full admin settings with payment keys |
| `PUT` | `/api/admin/settings` | Save store settings *(Admin)* |

### 🖼️ Banners & Promotions (`/api/banners`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/banners` | Active hero & promo banners |
| `POST` | `/api/banners` | Create banner *(Admin)* |
| `PUT` | `/api/banners/:id` | Update banner *(Admin)* |
| `DELETE` | `/api/banners/:id` | Delete banner *(Admin)* |

### 🔥 Limited-Time Deals (`/api/deals`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/deals` | List active flash deals & countdown timers |
| `POST` | `/api/deals` | Create flash deal *(Admin)* |
| `DELETE` | `/api/deals/:id` | Delete deal *(Admin)* |

### 📢 Announcement Bar (`/api/ad-banner`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ad-banner` | Fetch top sticky announcement marquee/banner |
| `POST` | `/api/ad-banner` | Update announcement bar text & style *(Admin)* |

### 🛒 Abandoned Checkout Recovery (`/api/abandoned-checkout`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/abandoned-checkout` | Record dropped checkout session |
| `GET` | `/api/abandoned-checkout` | View abandoned carts *(Admin)* |

### 🤖 AI Shopping Assistant (`/api/ai/assistant`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/assistant` | Natural language budget parser & product recommendation bot |

### 📲 WhatsApp Notifications (`/api/notifications/whatsapp`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notifications/whatsapp` | Generate WhatsApp alerts & deep-links for order updates & recovery |


### 🎟️ Coupons (`/api/coupons`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/coupons/validate` | Validate coupon code & calculate discount (`BOOST20`, `WELCOME10`) |
| `GET` | `/api/coupons` | List all coupons *(Admin)* |
| `POST` | `/api/coupons` | Create coupon *(Admin)* |
| `DELETE` | `/api/coupons/:id` | Delete coupon *(Admin)* |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews?productId=:id` | Product reviews & average rating breakdown |
| `POST` | `/api/reviews` | Submit product review & auto-recalculate product rating |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment HMAC SHA256 signature |
| `POST` | `/api/payments/webhook` | Handle Razorpay captured webhooks |

### 🚚 Shipping & Pincodes (`/api/shipping`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipping/pincode/:pincode` | Indian 6-digit PIN code serviceability & delivery ETA |
| `POST` | `/api/shipping/create-shipment` | Generate Delhivery/Shiprocket shipment & AWB |
| `GET` | `/api/shipping/track/:awb` | Live shipment timeline tracking |

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Send mobile OTP *(Test OTP: 1234)* |
| `POST` | `/api/auth/verify-otp` | Verify OTP & sign JWT token |
| `POST` | `/api/auth/login` | Email/password login *(Default Admin: admin@boost.com / admin123)* |
| `POST` | `/api/auth/register` | Register new account |
| `GET` | `/api/auth/me` | Authenticated profile & address book |

### 📊 Admin Analytics & Utilities (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard KPIs (Revenue, Orders, Products, Customers) |
| `POST` | `/api/admin/upload` | Media & image upload endpoint |
| `GET` | `/api/admin/contact-queries` | View customer queries |
| `GET` | `/api/admin/subscribers` | View newsletter subscribers |

### 🤝 Support & Compliance (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contact` | Customer contact form submission |
| `POST` | `/api/newsletter/subscribe` | Footer newsletter subscription |
| `POST` | `/api/warranty/register` | Product warranty registration |
| `POST` | `/api/warranty/claim` | File warranty claim |
| `GET` | `/api/policies/:type` | Fetch policy (`privacy`, `terms`, `refund`, `shipping`) |

---

## 🐳 Production Deployment

### Docker
```bash
docker build -t boost-express-api .
docker run -p 3001:3001 --env-file .env boost-express-api
```

### PM2 Process Manager
```bash
npm run build
npm run start:pm2
```
