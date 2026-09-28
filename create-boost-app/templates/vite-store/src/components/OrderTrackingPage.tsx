import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PlacedOrder } from '../types/store';
import {
  TruckIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  SearchIcon,
  ZapIcon,
} from './Icons';

export default function OrderTrackingPage() {
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  const { placedOrders } = useStore();

  const [searchInput, setSearchInput] = useState<string>(paramOrderId || '');
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const findOrder = async (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;

    setLoading(true);
    setErrorMessage(null);

    // 1. Check local placed orders first
    const localMatch = placedOrders.find(
      (o) => o.orderId.toUpperCase() === cleanId.toUpperCase()
    );
    if (localMatch) {
      setOrder(localMatch);
      setLoading(false);
      return;
    }

    // 2. Fetch from backend API
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${apiBase}/orders/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore network errors
    }

    setOrder(null);
    setErrorMessage(`Order "${cleanId}" not found. Please double-check your Order ID.`);
    setLoading(false);
  };


  useEffect(() => {
    if (paramOrderId) {
      setSearchInput(paramOrderId);
      findOrder(paramOrderId);
    } else if (placedOrders.length > 0) {
      setOrder(placedOrders[0]);
      setSearchInput(placedOrders[0].orderId);
    }
  }, [paramOrderId, placedOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findOrder(searchInput);
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Payment verified & order confirmed' },
    { key: 'confirmed', label: 'QC & Packed', desc: 'Packed at fulfillment center' },
    { key: 'dispatched', label: 'In Transit', desc: 'Shipped via Express Courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed over to customer' },
  ];

  const getStepState = (stepKey: string) => {
    if (!order) return 'upcoming';
    const hierarchy = ['placed', 'confirmed', 'dispatched', 'delivered'];
    const currentIdx = hierarchy.indexOf(order.orderStatus);
    const stepIdx = hierarchy.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #27272a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ZapIcon size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px' }}>BOOST STORE</span>
        </Link>

        <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          ← Storefront
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Track Your Order</h1>
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
          Real-time delivery milestones & GST invoice for your streetwear purchases.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              required
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter your Order ID (e.g. BST-912832)"
              style={{
                width: '100%',
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SearchIcon size={16} />
            <span>{loading ? 'Locating...' : 'Track'}</span>
          </button>
        </form>

        {errorMessage && (
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#451a1a', border: '1px solid #7f1d1d', color: '#fca5a5', marginBottom: '24px', fontSize: '13px' }}>
            {errorMessage}
          </div>
        )}

        {/* Tracking Details */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Status Card */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>ORDER NUMBER</span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: '#38bdf8' }}>{order.orderId}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>ESTIMATED DELIVERY</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>2-3 Business Days</div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '24px 0' }}>
                {steps.map((st) => {
                  const state = getStepState(st.key);
                  const isDone = state === 'completed';
                  const isActive = state === 'active';

                  return (
                    <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#10b981' : isActive ? '#0284c7' : '#27272a',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px',
                          border: isActive ? '2px solid #38bdf8' : 'none',
                        }}
                      >
                        {isDone ? <CheckCircleIcon size={20} /> : <TruckIcon size={16} />}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isDone || isActive ? '#ffffff' : '#71717a' }}>
                        {st.label}
                      </span>
                      <span style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }} className="hidden sm:inline">
                        {st.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {order.trackingNumber && (
                <div style={{ backgroundColor: '#09090b', borderRadius: '10px', padding: '12px 16px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: '#a1a1aa' }}>Courier Partner: {order.courierName || 'Delhivery Express'}</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>AWB: {order.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* Items & Invoice Summary */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBagIcon size={18} />
                <span>Purchased Items & GST Invoice</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                        Qty: {item.quantity} • Size: {item.selectedSize || 'M'}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                  <span>Shipping Fee</span>
                  <span style={{ color: '#10b981' }}>FREE (Pan-India)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: '11px' }}>
                  <span>Inclusive Indian GST (18%)</span>
                  <span>Calculated</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '1px solid #27272a', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Total Paid</span>
                  <span style={{ color: '#38bdf8' }}>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Shipping Address</h3>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '14px' }}>{order.customer.name}</p>
              <p style={{ margin: '0 0 4px 0', color: '#a1a1aa', fontSize: '13px' }}>{order.customer.address}</p>
              <p style={{ margin: '0 0 8px 0', color: '#a1a1aa', fontSize: '13px' }}>
                {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '13px' }}>Mobile: {order.customer.phone}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
