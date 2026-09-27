import assert from 'assert';
import http from 'http';
import crypto from 'crypto';
import { app } from '../src/server';

export async function runApiTests() {
  console.log('\n\x1b[36m--- [3/3] Running Exhaustive End-to-End HTTP API Integration Tests ---\x1b[0m');

  // Start HTTP server on an OS-assigned ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  let adminJwtToken = '';
  let customerJwtToken = '';
  let testOrderId = '';

  try {
    // 1. Health & Ping Endpoint
    console.log('  Testing GET /api/health...');
    {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.status, 'ok');
      assert.ok(data.uptime !== undefined);
      console.log('  \x1b[32m✔ Health check passed\x1b[0m');
    }

    // 2. Root API Directory & Security Headers
    console.log('  Testing GET / & Security Headers...');
    {
      const res = await fetch(`${baseUrl}/`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.strictEqual(res.headers.get('x-powered-by'), null, 'X-Powered-By header must be hidden');
      console.log('  \x1b[32m✔ Root directory & security headers passed\x1b[0m');
    }

    // 3. Products Catalog (List, Search & Featured)
    console.log('  Testing GET /api/products (Catalog & Sanitized Search)...');
    {
      const res = await fetch(`${baseUrl}/api/products`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.products), 'Products must be an array');
      assert.ok(data.products.length > 0, 'Catalog should return default demo products');

      // Test Search with special regex characters (should NOT crash with 500)
      const searchRes = await fetch(`${baseUrl}/api/products?search=(heavy`);
      assert.strictEqual(searchRes.status, 200, 'Search with regex characters must return 200 OK');
      const searchData = (await searchRes.json()) as any;
      assert.strictEqual(searchData.success, true);

      // Featured products
      const featuredRes = await fetch(`${baseUrl}/api/products/featured`);
      assert.strictEqual(featuredRes.status, 200);
      const featuredData = (await featuredRes.json()) as any;
      assert.strictEqual(featuredData.success, true);
      assert.ok(featuredData.products.length > 0);

      // Product detail by slug or ID
      const detailRes = await fetch(`${baseUrl}/api/products/prod_1`);
      assert.strictEqual(detailRes.status, 200);
      const detailData = (await detailRes.json()) as any;
      assert.strictEqual(detailData.success, true);
      assert.strictEqual(detailData.product.id, 'prod_1');

      console.log('  \x1b[32m✔ Products catalog, detail by slug & safe regex search passed\x1b[0m');
    }

    // 4. Categories Endpoint
    console.log('  Testing GET /api/categories & category detail...');
    {
      const res = await fetch(`${baseUrl}/api/categories`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.categories));

      const slugRes = await fetch(`${baseUrl}/api/categories/hoodies`);
      assert.strictEqual(slugRes.status, 200);
      console.log('  \x1b[32m✔ Categories list & slug lookup passed\x1b[0m');
    }

    // 5. Coupons Validation Endpoint
    console.log('  Testing POST /api/coupons/validate...');
    {
      // Valid coupon
      const validRes = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'BOOST20', cartTotal: 1500 }),
      });
      assert.strictEqual(validRes.status, 200);
      const validData = (await validRes.json()) as any;
      assert.strictEqual(validData.success, true);
      assert.strictEqual(validData.valid, true);

      // Invalid empty coupon (Body Validation test)
      const emptyRes = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '' }),
      });
      assert.strictEqual(emptyRes.status, 400, 'Empty coupon code must fail validation with 400');
      console.log('  \x1b[32m✔ Coupon validation & error handling passed\x1b[0m');
    }

    // 6. Shipping Pincode Lookup & Param Validation
    console.log('  Testing GET /api/shipping/pincode/:pincode...');
    {
      // Valid 6-digit Indian Pincode
      const res = await fetch(`${baseUrl}/api/shipping/pincode/110001`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.city, 'New Delhi');

      // Invalid Pincode (Param validation check)
      const badRes = await fetch(`${baseUrl}/api/shipping/pincode/abc`);
      assert.strictEqual(badRes.status, 400, 'Invalid pincode format must return 400');
      const badData = (await badRes.json()) as any;
      assert.strictEqual(badData.success, false);
      assert.strictEqual(badData.error, 'Validation failed');
      console.log('  \x1b[32m✔ Shipping pincode lookup & param validation passed\x1b[0m');
    }

    // 7. Auth Endpoints: OTP, Login & JWT Profile
    console.log('  Testing Auth Routes (OTP, Admin Login, Me Profile)...');
    {
      // Invalid phone format
      const badPhoneRes = await fetch(`${baseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '123' }),
      });
      assert.strictEqual(badPhoneRes.status, 400);

      // Valid Indian 10-digit phone
      const validPhoneRes = await fetch(`${baseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210' }),
      });
      assert.strictEqual(validPhoneRes.status, 200);
      const otpData = (await validPhoneRes.json()) as any;
      assert.strictEqual(otpData.success, true);
      assert.strictEqual(otpData.mockOtp, '1234');

      // Verify OTP and capture customer token
      const verifyRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', otp: '1234' }),
      });
      assert.strictEqual(verifyRes.status, 200);
      const authData = (await verifyRes.json()) as any;
      assert.strictEqual(authData.success, true);
      assert.ok(authData.token, 'Should return customer JWT token');
      customerJwtToken = authData.token;

      // Admin Login with Demo Credentials
      const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@boost.com', password: 'admin123' }),
      });
      assert.strictEqual(adminLoginRes.status, 200);
      const adminData = (await adminLoginRes.json()) as any;
      assert.strictEqual(adminData.success, true);
      assert.strictEqual(adminData.user.role, 'admin');
      assert.ok(adminData.token, 'Should return admin JWT token');
      adminJwtToken = adminData.token;

      // GET /api/auth/me with Bearer token
      const meRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${customerJwtToken}` },
      });
      assert.strictEqual(meRes.status, 200);
      const meData = (await meRes.json()) as any;
      assert.strictEqual(meData.success, true);
      assert.strictEqual(meData.user.phone, '9876543210');

      // GET /api/auth/me without token -> 401
      const noAuthRes = await fetch(`${baseUrl}/api/auth/me`);
      assert.strictEqual(noAuthRes.status, 401);

      console.log('  \x1b[32m✔ Auth validation, OTP verification, Admin login & /me profile passed\x1b[0m');
    }

    // 8. Order Placement & Order Tracking
    console.log('  Testing Orders Workflow (Create, Lookup & Track)...');
    {
      const orderPayload = {
        customer: {
          name: 'Priya Sharma',
          phone: '+91 98765 12345',
          email: 'priya@example.com',
          address: '102 Lotus Enclave',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        items: [
          {
            productId: 'prod_1',
            title: 'Cyberpunk Heavyweight 450 GSM Hoodie',
            price: 2499,
            quantity: 1,
            selectedSize: 'L',
            selectedColor: 'Onyx Black',
          },
        ],
        paymentMethod: 'cod',
        couponCode: 'BOOST20',
      };

      const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      assert.strictEqual(res.status, 201);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.order.orderId.startsWith('ORD-'));
      assert.strictEqual(data.order.paymentMethod, 'cod');
      assert.ok(data.order.gst.totalGst > 0, 'GST must be computed');
      testOrderId = data.order.orderId;

      // Customer Order Lookup with phone query
      const myOrdersRes = await fetch(`${baseUrl}/api/orders?phone=9876512345`);
      assert.strictEqual(myOrdersRes.status, 200);

      // Order Tracking by ID & Phone
      const trackRes = await fetch(`${baseUrl}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: testOrderId, phone: '9876512345' }),
      });
      assert.strictEqual(trackRes.status, 200);
      const trackData = (await trackRes.json()) as any;
      assert.strictEqual(trackData.success, true);

      console.log('  \x1b[32m✔ Order creation, Indian GST, lookup & track passed\x1b[0m');
    }

    // 9. Payment Order Creation & Signature Validation
    console.log('  Testing Payments API...');
    {
      // Missing / invalid amount
      const badPayRes = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: -500 }),
      });
      assert.strictEqual(badPayRes.status, 400);

      // Valid amount
      const payRes = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1999 }),
      });
      assert.strictEqual(payRes.status, 200);
      const payData = (await payRes.json()) as any;
      assert.strictEqual(payData.success, true);

      // Verification validation check
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const validSig = secret
        ? crypto.createHmac('sha256', secret).update('order_test_123|pay_test_456').digest('hex')
        : 'sig_mock_789';

      const verifyPayRes = await fetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_456',
          razorpay_signature: validSig,
        }),
      });
      assert.strictEqual(verifyPayRes.status, 200);
      console.log('  \x1b[32m✔ Payment order generation & verification passed\x1b[0m');
    }

    // 10. Reviews API
    console.log('  Testing Reviews API (Query & Submission)...');
    {
      // Query reviews for prod_1
      const res = await fetch(`${baseUrl}/api/reviews?productId=prod_1`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.reviews));

      // Post new review
      const postReviewRes = await fetch(`${baseUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'prod_1',
          author: 'Test Reviewer',
          rating: 5,
          title: 'Awesome Fit!',
          comment: 'Fits comfortably oversized, premium feel.',
        }),
      });
      assert.strictEqual(postReviewRes.status, 201);
      console.log('  \x1b[32m✔ Reviews query & customer review submission passed\x1b[0m');
    }

    // 11. Promotional Endpoints: Deals, Banners & Ad Banner
    console.log('  Testing Promotional APIs (Deals, Banners, Ad Banner)...');
    {
      const dealsRes = await fetch(`${baseUrl}/api/deals`);
      assert.strictEqual(dealsRes.status, 200);
      const dealsData = (await dealsRes.json()) as any;
      assert.strictEqual(dealsData.success, true);

      const bannersRes = await fetch(`${baseUrl}/api/banners`);
      assert.strictEqual(bannersRes.status, 200);
      const bannersData = (await bannersRes.json()) as any;
      assert.strictEqual(bannersData.success, true);

      const adBannerRes = await fetch(`${baseUrl}/api/ad-banner`);
      assert.strictEqual(adBannerRes.status, 200);
      console.log('  \x1b[32m✔ Deals, Banners & Top Ad-Banner endpoints passed\x1b[0m');
    }

    // 12. Settings & Security Masking
    console.log('  Testing Settings & Secret Masking...');
    {
      const res = await fetch(`${baseUrl}/api/settings`);
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.settings.storeName !== undefined);
      // Ensure private secrets are NEVER returned in public settings
      assert.strictEqual(data.settings.razorpayKeySecret, undefined, 'Razorpay secret must NOT leak in public settings');
      assert.strictEqual(data.settings.phonepeSaltKey, undefined, 'PhonePe salt must NOT leak');
      console.log('  \x1b[32m✔ Public settings safely exposed without payment secrets\x1b[0m');
    }

    // 13. Customer Support, Newsletter & Policies
    console.log('  Testing Support, Contact, Newsletter & Policies...');
    {
      // Contact submission
      const contactRes = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Rohit Verma',
          email: 'rohit@example.com',
          message: 'Need help with bulk order inquiry',
        }),
      });
      assert.strictEqual(contactRes.status, 200);

      // Newsletter subscription
      const newsRes = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'subscriber@example.com' }),
      });
      assert.strictEqual(newsRes.status, 200);

      // Policies endpoint
      const policyRes = await fetch(`${baseUrl}/api/policies/privacy`);
      assert.strictEqual(policyRes.status, 200);

      // Invalid policy type (param validation check)
      const badPolicyRes = await fetch(`${baseUrl}/api/policies/hacked`);
      assert.strictEqual(badPolicyRes.status, 400);

      console.log('  \x1b[32m✔ Contact form, Newsletter & Policy endpoints passed\x1b[0m');
    }

    // 14. Abandoned Checkout Recovery Recording
    console.log('  Testing Abandoned Checkout API...');
    {
      const res = await fetch(`${baseUrl}/api/abandoned-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'cart_abandoner@example.com',
          phone: '9876500000',
          customerName: 'Samir',
          items: [{ productId: 'prod_1', price: 2499, quantity: 1 }],
          totalAmount: 2499,
        }),
      });
      assert.strictEqual(res.status, 201);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      console.log('  \x1b[32m✔ Abandoned checkout recording passed\x1b[0m');
    }

    // 15. AI Shopping Assistant
    console.log('  Testing AI Assistant Bot Endpoint...');
    {
      const res = await fetch(`${baseUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Recommend a good oversized hoodie for winter' }),
      });
      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.reply, 'AI assistant should return a reply');
      console.log('  \x1b[32m✔ AI assistant shopping advisor passed\x1b[0m');
    }

    // 16. Admin Authorization & Protected Routes
    console.log('  Testing Admin Protected Endpoints & Role Guards...');
    {
      // Admin Stats with Admin Token
      const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminJwtToken}` },
      });
      assert.strictEqual(statsRes.status, 200);
      const statsData = (await statsRes.json()) as any;
      assert.strictEqual(statsData.success, true);
      assert.ok(statsData.stats !== undefined);

      // Admin Settings with Admin Token
      const adminSettingsRes = await fetch(`${baseUrl}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${adminJwtToken}` },
      });
      assert.strictEqual(adminSettingsRes.status, 200);

      // Customer trying to access Admin Stats -> 403 Forbidden
      const customerBlockedRes = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${customerJwtToken}` },
      });
      assert.strictEqual(customerBlockedRes.status, 403, 'Customer role must be blocked from admin stats');

      console.log('  \x1b[32m✔ Admin authentication & customer role-restriction (403) verified\x1b[0m');
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
