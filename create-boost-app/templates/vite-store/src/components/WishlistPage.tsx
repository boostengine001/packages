import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../data/products';
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowRightIcon,
  ZapIcon,
  CheckIcon,
} from './Icons';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart, cartCount } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoveToCart = (product: Product) => {
    moveToCart(product);
    showToast(`Moved ${product.title} to Bag! 🛍️`);
  };

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    showToast('Removed from wishlist');
  };

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #27272a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ZapIcon size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>BOOST STORE</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>
            <ShoppingBagIcon size={18} />
            <span>Bag</span>
            {cartCount > 0 && (
              <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px' }}>
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            ← Storefront
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartIcon size={24} filled={true} style={{ color: '#ef4444' }} />
              <span>My Saved Wishlist</span>
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '6px' }}>
              {wishlist.length} item{wishlist.length === 1 ? '' : 's'} saved for later
            </p>
          </div>
          {wishlist.length > 0 && (
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <span>Explore More Items</span>
              <ArrowRightIcon size={14} />
            </Link>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#27272a', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <HeartIcon size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Your wishlist is empty</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Explore our trending collections and click the heart icon on any product to save your favorites here.
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
              <span>Discover Trending Drops</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {wishlist.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: '#18181b',
                  borderRadius: '14px',
                  border: '1px solid #27272a',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Product Image */}
                <div style={{ position: 'relative', height: '280px', overflow: 'hidden', backgroundColor: '#09090b' }}>
                  <Link to={`/product/${product.slug || product.id}`}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(product.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(9, 9, 11, 0.8)',
                      border: '1px solid #3f3f46',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Remove from wishlist"
                  >
                    <TrashIcon size={15} />
                  </button>
                  {product.compareAtPrice > product.price && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {product.category}
                  </span>
                  <Link
                    to={`/product/${product.slug || product.id}`}
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#ffffff',
                      textDecoration: 'none',
                      marginBottom: '8px',
                      lineHeight: '1.3',
                    }}
                  >
                    {product.title}
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>₹{product.price}</span>
                    {product.compareAtPrice > product.price && (
                      <span style={{ fontSize: '13px', color: '#71717a', textDecoration: 'line-through' }}>
                        ₹{product.compareAtPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <ShoppingBagIcon size={16} />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#18181b',
            color: '#ffffff',
            border: '1px solid #38bdf8',
            padding: '12px 24px',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 9999,
          }}
          className="animate-pop-in"
        >
          <CheckIcon size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
