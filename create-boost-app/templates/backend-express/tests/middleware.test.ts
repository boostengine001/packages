import assert from 'assert';
import { Request, Response } from 'express';
import { validate, rules } from '../src/middleware/validator';
import { securityHeaders } from '../src/middleware/security';
import { createRateLimiter } from '../src/middleware/rateLimiter';
import { requireAdmin } from '../src/middleware/auth';

function createMockReqRes(options: {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}) {
  const req: any = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    socket: { remoteAddress: '127.0.0.1' },
  };

  let statusCode = 200;
  let jsonResponse: any = null;
  const setHeaders: Record<string, any> = {};

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      jsonResponse = data;
      return res;
    },
    setHeader(name: string, value: any) {
      setHeaders[name.toLowerCase()] = value;
    },
    getHeader(name: string) {
      return setHeaders[name.toLowerCase()];
    },
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
    getHeaders: () => setHeaders,
  };
}

export async function runMiddlewareTests() {
  console.log('\n\x1b[36m--- [2/3] Running Middleware & Validation Tests ---\x1b[0m');

  // 1. Validator Rules Tests
  console.log('  Testing Schema Validation Engine (body, params, query)...');
  {
    // A. Valid Indian Mobile Number & Pincode
    const schema = validate({
      body: {
        phone: [rules.required('Phone'), rules.indianPhone('Phone')],
        pincode: [rules.required('Pincode'), rules.pincode('Pincode')],
        amount: [rules.required('Amount'), rules.positiveNumber('Amount')],
      },
    });

    const validMock = createMockReqRes({
      body: { phone: '9876543210', pincode: '110001', amount: 1499 },
    });
    let nextCalled = false;
    schema(validMock.req, validMock.res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true, 'Next() should be called when body is completely valid');

    // B. Invalid Phone, Negative Amount, Missing Pincode
    const invalidMock = createMockReqRes({
      body: { phone: '12345', pincode: '', amount: -100 },
    });
    let invalidNext = false;
    schema(invalidMock.req, invalidMock.res, () => {
      invalidNext = true;
    });
    assert.strictEqual(invalidNext, false, 'Next() must not be called when validation fails');
    assert.strictEqual(invalidMock.getStatusCode(), 400, 'Should return HTTP 400 Bad Request');
    const errRes = invalidMock.getJsonResponse();
    assert.strictEqual(errRes.success, false);
    assert.strictEqual(errRes.error, 'Validation failed');
    assert.ok(errRes.details.length >= 3, 'Should list all failing fields');

    // C. Params validation test
    const paramSchema = validate({
      params: {
        pincode: [rules.required('Pincode'), rules.pincode('Pincode')],
      },
    });
    const validParamMock = createMockReqRes({ params: { pincode: '560038' } });
    let paramNext = false;
    paramSchema(validParamMock.req, validParamMock.res, () => {
      paramNext = true;
    });
    assert.strictEqual(paramNext, true, 'Valid param should proceed');

    console.log('  \x1b[32m✔ Schema validation rules (indianPhone, pincode, positiveNumber) passed\x1b[0m');
  }

  // 2. Security Headers Test
  console.log('  Testing Security Headers Middleware...');
  {
    const mock = createMockReqRes({});
    let nextCalled = false;
    securityHeaders(mock.req, mock.res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    const headers = mock.getHeaders();
    assert.strictEqual(headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(headers['x-frame-options'], 'SAMEORIGIN');
    assert.strictEqual(headers['x-xss-protection'], '0');
    assert.strictEqual(headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.strictEqual(headers['cross-origin-resource-policy'], 'cross-origin');
    console.log('  \x1b[32m✔ Security headers correctly assigned\x1b[0m');
  }

  // 3. Rate Limiter Test
  console.log('  Testing Sliding Window Rate Limiter...');
  {
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 2,
      message: 'Rate limit hit',
    });

    const mock1 = createMockReqRes({});
    let hit1 = false;
    limiter(mock1.req, mock1.res, () => {
      hit1 = true;
    });
    assert.strictEqual(hit1, true, 'First request should pass');
    assert.strictEqual(mock1.getHeaders()['x-ratelimit-remaining'], 1);

    const mock2 = createMockReqRes({});
    let hit2 = false;
    limiter(mock2.req, mock2.res, () => {
      hit2 = true;
    });
    assert.strictEqual(hit2, true, 'Second request should pass');
    assert.strictEqual(mock2.getHeaders()['x-ratelimit-remaining'], 0);

    const mock3 = createMockReqRes({});
    let hit3 = false;
    limiter(mock3.req, mock3.res, () => {
      hit3 = true;
    });
    assert.strictEqual(hit3, false, 'Third request should be blocked');
    assert.strictEqual(mock3.getStatusCode(), 429, 'Blocked request should return 429');
    assert.ok(mock3.getHeaders()['retry-after'], 'Should provide Retry-After header');
    console.log('  \x1b[32m✔ Rate limiter tracks count and enforces 429 Too Many Requests\x1b[0m');
  }
}
