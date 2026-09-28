import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBagIcon,
  TrashIcon,
  MapPinIcon,
  TagIcon,
  LockIcon,
  CheckIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BanknoteIcon,
  UserIcon,
  PhoneIcon,
  ArrowRightIcon,
  ZapIcon,
  TruckIcon,
} from './Icons';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    discountPercent,
    applyCoupon,
    removeCoupon,
    deliveryPincode,
    setDeliveryPincode,
    pincodeInfo,
    createOrder,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState<string>('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Checkout inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    total: number;
    paymentMethod: string;
    city: string;
  } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const result = await applyCoupon(couponInput);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponInput('');
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutError('Please fill in your Delivery Name, Mobile, and Full Address.');
      return;
    }
    if (customerPhone.trim().replace(/\D/g, '').length < 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    const customerData = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      city: pincodeInfo.city,
      state: pincodeInfo.state,
      pincode: deliveryPincode,
    };

    // Online Razorpay Flow
    if (paymentMethod === 'online') {
      const scriptLoaded = await loadRazorpayScript();
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

      if (scriptLoaded && window.Razorpay && settings.razorpayKeyId && !settings.razorpayKeyId.includes('mock')) {
        try {
          const rzpRes = await fetch(`${apiBase}/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: cartTotal }),
          });

          if (rzpRes.ok) {
            const rzpData = await rzpRes.json();
            if (rzpData.order && rzpData.order.id) {
              const options = {
                key: settings.razorpayKeyId,
                amount: rzpData.order.amount,
                currency: 'INR',
                name: settings.storeName || 'Boost Store',
                description: 'Payment for Streetwear Order',
                order_id: rzpData.order.id,
                prefill: {
                  name: customerData.name,
                  contact: customerData.phone,
                },
                theme: {
                  color: '#0284c7',
                },
                handler: async (response: any) => {
                  await createOrder({
                    customer: customerData,
                    paymentMethod: 'online',
                    paymentStatus: 'paid',
                  });

                  setOrderSuccess({
                    orderId: response.razorpay_order_id || 'BST-ONLINE',
                    total: cartTotal,
                    paymentMethod: 'Instant Online (Razorpay / UPI)',
                    city: pincodeInfo.city,
                  });
                  setIsSubmitting(false);
                },
                modal: {
                  ondismiss: () => {
                    setIsSubmitting(false);
                  },
                },
              };

              const rzp = new window.Razorpay(options);
              rzp.open();
              return;
            }
          }
        } catch {
          // Fall through to mock payment flow
        }
      }
    }

    // COD or Simulated Online Payment
    const result = await createOrder({
      customer: customerData,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'cod_pending',
    });

    setIsSubmitting(false);

    if (result.success) {
      setOrderSuccess({
        orderId: result.orderId,
        total: cartTotal,
        paymentMethod: paymentMethod === 'online' ? 'Instant Online (Razorpay / UPI Verified)' : 'Cash on Delivery (COD)',
        city: pincodeInfo.city,
      });
    } else {
      setCheckoutError(result.error || 'Unable to place order. Please try again.');
    }
  };

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '36px 28px', textAlign: 'center' }} className="animate-pop-in">
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#064e3b', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircleIcon size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0' }}>Order Confirmed! 🎉</h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 24px 0' }}>
            Thank you! Your order has been placed successfully and routed to our warehouse.
          </p>

          <div style={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#71717a' }}>Order ID:</span>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>{orderSuccess.orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#71717a' }}>Amount:</span>
              <span style={{ fontWeight: 800 }}>₹{orderSuccess.total} (Incl. GST)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#71717a' }}>Payment Mode:</span>
              <span style={{ fontWeight: 600 }}>{orderSuccess.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#71717a' }}>Delivery Hub:</span>
              <span style={{ fontWeight: 600 }}>{orderSuccess.city} (Express 2-3 Days)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate(`/orders/${orderSuccess.orderId}`)}
              style={{
                width: '100%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <TruckIcon size={16} />
              <span>Track Live Delivery Status</span>
            </button>

            <Link
              to="/"
              style={{
                display: 'block',
                padding: '10px',
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#18181b', borderBottom: '1px solid #27272a', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName || 'Store Logo'}
                style={{ height: '34px', maxHeight: '34px', maxWidth: '140px', objectFit: 'contain', borderRadius: '6px' }}
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ZapIcon size={18} />
              </div>
            )}
            <span style={{ fontSize: '18px', fontWeight: 800 }}>{settings?.storeName || 'BOOST STORE'}</span>
          </Link>

          <Link to="/" style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingBagIcon size={24} style={{ color: '#38bdf8' }} />
          <span>Shopping Bag & Instant Checkout</span>
          {cartCount > 0 && <span style={{ fontSize: '16px', color: '#a1a1aa' }}>({cartCount} items)</span>}
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#27272a', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShoppingBagIcon size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Your bag is empty</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', maxWidth: '380px', margin: '0 auto 24px' }}>
              Explore our trending winter drops and add premium heavyweight streetwear to your cart.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <span>Explore Streetwear Drops</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left: Cart Items List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#a1a1aa' }}>BAG ITEMS ({cartCount})</span>
                <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.size}-${index}`}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      border: '1px solid #27272a',
                      padding: '14px',
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      style={{ width: '84px', height: '96px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.product.category}
                          </span>
                          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0 6px 0', lineHeight: 1.3 }}>
                            {item.product.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '2px' }}
                          title="Remove item"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>
                        Size: <span style={{ color: '#fff', fontWeight: 600 }}>{item.size || 'M'}</span> • Color: <span style={{ color: '#fff', fontWeight: 600 }}>{item.color || 'Standard'}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        {/* Qty Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #3f3f46', borderRadius: '6px', overflow: 'hidden' }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, -1)}
                            style={{ backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '14px' }}
                          >
                            -
                          </button>
                          <span style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, 1)}
                            style={{ backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '14px' }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800 }}>₹{item.product.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Bar */}
              <div style={{ marginTop: '20px', backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <TagIcon size={14} style={{ color: '#fbbf24' }} />
                  <span>APPLY STORE COUPON</span>
                </span>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#064e3b', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                      <CheckIcon size={16} />
                      <span>{appliedCoupon} ({discountPercent}% OFF) APPLIED</span>
                    </div>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. BOOST20 or WELCOME10"
                      style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: '#27272a', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#ef4444' }}>{couponError}</p>}
              </div>
            </div>

            {/* Right: Checkout & Payment Section */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Delivery & Payment</h2>

              <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <UserIcon size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kabir Verma"
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneIcon size={14} /> Mobile (10-Digit)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MapPinIcon size={14} /> Complete Shipping Address
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="House / Flat No., Landmark, Sector"
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <TruckIcon size={14} /> Pincode
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                      style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                    />
                    <div style={{ backgroundColor: '#27272a', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                      {pincodeInfo.city} ({pincodeInfo.days})
                    </div>
                  </div>
                </div>

                {/* Payment Selection */}
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '8px' }}>
                    Select Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: paymentMethod === 'online' ? '2px solid #38bdf8' : '1px solid #3f3f46',
                        backgroundColor: paymentMethod === 'online' ? '#0c4a6e' : '#09090b',
                        color: paymentMethod === 'online' ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                        <CreditCardIcon size={16} />
                        <span>UPI / Cards</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Fastest Checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: paymentMethod === 'cod' ? '2px solid #38bdf8' : '1px solid #3f3f46',
                        backgroundColor: paymentMethod === 'cod' ? '#0c4a6e' : '#09090b',
                        color: paymentMethod === 'cod' ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                        <BanknoteIcon size={16} />
                        <span>Cash on Delivery</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Pay at Doorstep</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ backgroundColor: '#09090b', borderRadius: '10px', border: '1px solid #27272a', padding: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#71717a' }}>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#10b981' }}>
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{cartDiscount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#71717a' }}>Shipping</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>FREE (Express)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: '#71717a' }}>
                    <span>Inclusive GST (18%)</span>
                    <span>₹{Math.round((cartTotal / 1.18) * 0.18)} (Calculated)</span>
                  </div>
                  <div style={{ borderTop: '1px solid #27272a', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                    <span>Total Amount</span>
                    <span style={{ color: '#38bdf8' }}>₹{cartTotal}</span>
                  </div>
                </div>

                {checkoutError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      color: '#fca5a5',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {checkoutError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <LockIcon size={16} />
                  <span>
                    {isSubmitting
                      ? 'Processing Order...'
                      : paymentMethod === 'online'
                      ? `Pay ₹${cartTotal} Online`
                      : `Confirm Cash on Delivery (₹${cartTotal})`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
