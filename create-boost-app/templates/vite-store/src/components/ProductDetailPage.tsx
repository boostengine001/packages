import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DEMO_PRODUCTS, Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductReview } from '../types/store';
import {
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  RotateCcwIcon,
  CheckIcon,
  ZapIcon,
  ArrowRightIcon,
  LockIcon,
  HeartIcon,
  SparklesIcon,
} from './Icons';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, cartCount, verifyPincode, pincodeInfo } = useStore();

  const [product, setProduct] = useState<Product>(() => {
    return DEMO_PRODUCTS.find((p) => p.id === id || (p.slug && p.slug === id)) || DEMO_PRODUCTS[0];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || 'Black');
  const [pincodeInput, setPincodeInput] = useState<string>('110001');
  const [isVerifyingPincode, setIsVerifyingPincode] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev_1',
      productId: product.id,
      customerName: 'Aarav Malhotra',
      rating: 5,
      title: 'Insane fabric quality!',
      comment: 'The 450 GSM weight is real heavyweight luxury streetwear. Best purchase this winter.',
      verifiedPurchase: true,
      createdAt: '2 days ago',
    },
    {
      id: 'rev_2',
      productId: product.id,
      customerName: 'Rohan Sharma',
      rating: 5,
      title: 'Perfect boxy fit',
      comment: 'True to size with the exact dropped shoulder fit I was looking for. Express delivery took 2 days.',
      verifiedPurchase: true,
      createdAt: '1 week ago',
    },
  ]);

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // Fetch live product from API
  useEffect(() => {
    setIsLoading(true);
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    fetch(`${apiBase}/products/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.image);
          if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
          if (data.product.colors?.length) setSelectedColor(data.product.colors[0]);
        }
      })
      .catch(() => {
        // Fallback to local DEMO_PRODUCTS
        const fallback = DEMO_PRODUCTS.find((p) => p.id === id || (p.slug && p.slug === id)) || DEMO_PRODUCTS[0];
        setProduct(fallback);
        setSelectedImage(fallback.image);
        if (fallback.sizes?.length) setSelectedSize(fallback.sizes[0]);
        if (fallback.colors?.length) setSelectedColor(fallback.colors[0]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch Reviews
    fetch(`${apiBase}/reviews?productId=${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, [id]);

  const defaultSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const defaultColors = product.colors && product.colors.length > 0 ? product.colors : ['Onyx Black'];
  const defaultImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor);
    navigate('/cart');
  };

  const handleVerifyPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length !== 6) return;
    setIsVerifyingPincode(true);
    await verifyPincode(pincodeInput);
    setIsVerifyingPincode(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: ProductReview = {
      id: 'rev_' + Date.now(),
      productId: product.id,
      customerName: newReviewAuthor.trim(),
      rating: newReviewRating,
      title: newReviewTitle.trim() || 'Great product!',
      comment: newReviewComment.trim(),
      verifiedPurchase: true,
      createdAt: 'Just now',
    };

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      await fetch(`${apiBase}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev),
      });
    } catch {
      // Local fallback
    }

    setReviews((prev) => [newRev, ...prev]);
    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
  };

  const inWish = isInWishlist(product.id);

  if (isLoading && !product) {
    return (
      <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
        <span>Loading product details...</span>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid #27272a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ZapIcon size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>BOOST STORE</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/wishlist" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <HeartIcon size={18} />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>
            <ShoppingBagIcon size={18} />
            <span>Bag</span>
            {cartCount > 0 && (
              <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', fontSize: '12px', color: '#71717a' }}>
        <Link to="/" style={{ color: '#71717a', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#a1a1aa' }}>{product.category}</span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#ffffff' }}>{product.title}</span>
      </nav>

      {/* Main Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              <img
                src={selectedImage}
                alt={product.title}
                style={{ width: '100%', height: '520px', objectFit: 'cover' }}
              />
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(9, 9, 11, 0.85)',
                  border: '1px solid #3f3f46',
                  color: inWish ? '#ef4444' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HeartIcon size={20} filled={inWish} />
              </button>

              {product.compareAtPrice > product.price && (
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>
                  SAVE ₹{product.compareAtPrice - product.price} (35% OFF)
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {defaultImages.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', overflowX: 'auto' }}>
                {defaultImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      border: selectedImage === img ? '2px solid #38bdf8' : '1px solid #27272a',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ backgroundColor: '#0369a1', color: '#e0f2fe', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                {product.category}
              </span>
              <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon size={14} /> In Stock • Ready for Dispatch
              </span>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 12px 0' }}>
              {product.title}
            </h1>

            {/* Ratings Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#27272a', padding: '4px 8px', borderRadius: '6px' }}>
                <StarIcon size={14} filled={true} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '13px', fontWeight: 800 }}>{product.rating || 4.9}</span>
              </div>
              <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                Based on {reviews.length} verified Indian customer reviews
              </span>
            </div>

            {/* Price Block */}
            <div style={{ backgroundColor: '#18181b', padding: '16px 20px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>₹{product.price}</span>
                {product.compareAtPrice > product.price && (
                  <span style={{ fontSize: '18px', color: '#71717a', textDecoration: 'line-through' }}>
                    ₹{product.compareAtPrice}
                  </span>
                )}
                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                  Inclusive of 18% Indian GST (CGST + SGST)
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>SELECT SIZE</span>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>True to Indian Streetwear Fit</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {defaultSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: selectedSize === sz ? '2px solid #38bdf8' : '1px solid #3f3f46',
                      backgroundColor: selectedSize === sz ? '#0c4a6e' : '#18181b',
                      color: selectedSize === sz ? '#38bdf8' : '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                COLOR: <span style={{ color: '#38bdf8' }}>{selectedColor}</span>
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {defaultColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: selectedColor === col ? '2px solid #38bdf8' : '1px solid #3f3f46',
                      backgroundColor: selectedColor === col ? '#0c4a6e' : '#18181b',
                      color: selectedColor === col ? '#38bdf8' : '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  backgroundColor: isAdded ? '#059669' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isAdded ? (
                  <>
                    <CheckIcon size={18} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon size={18} />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Buy Now (Express)</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>

            {/* Pincode & Delivery Checker */}
            <div style={{ backgroundColor: '#18181b', padding: '16px 20px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', display: 'block', marginBottom: '8px' }}>
                DELIVERY SERVICEABILITY & ESTIMATE
              </span>
              <form onSubmit={handleVerifyPincode} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  style={{
                    flex: 1,
                    backgroundColor: '#09090b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="submit"
                  disabled={isVerifyingPincode}
                  style={{
                    backgroundColor: '#27272a',
                    color: '#38bdf8',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isVerifyingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>
              <div style={{ marginTop: '10px', fontSize: '12px', color: pincodeInfo.serviceable ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={14} />
                <span>
                  {pincodeInfo.serviceable
                    ? `Eligible for delivery to ${pincodeInfo.city} (${pincodeInfo.days}) • COD Available`
                    : 'Pincode not currently serviceable'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid #27272a', paddingTop: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Product Overview</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>{product.description}</p>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <TruckIcon size={16} style={{ color: '#38bdf8' }} />
                <span>Pan-India 2-3 Day Dispatch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <ShieldCheckIcon size={16} style={{ color: '#38bdf8' }} />
                <span>6-Month Stitching Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <RotateCcwIcon size={16} style={{ color: '#38bdf8' }} />
                <span>7-Day Doorstep Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <LockIcon size={16} style={{ color: '#38bdf8' }} />
                <span>100% Encrypted UPI & COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section style={{ marginTop: '64px', borderTop: '1px solid #27272a', paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>Customer Reviews</h2>
              <p style={{ color: '#a1a1aa', fontSize: '13px' }}>Verified feedback from buyers across India</p>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              style={{
                backgroundColor: '#27272a',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <SparklesIcon size={14} />
              <span>Write a Review</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <StarIcon key={i} size={14} filled={true} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>{rev.createdAt}</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>{rev.title}</h4>
                <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '12px' }}>{rev.comment}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                  <span style={{ fontWeight: 600 }}>{rev.customerName}</span>
                  {rev.verifiedPurchase && (
                    <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckIcon size={12} /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Rate & Review</h3>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= newReviewRating ? '#fbbf24' : '#3f3f46' }}
                    >
                      <StarIcon size={24} filled={star <= newReviewRating} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Your Name</label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Aryan Khan"
                  style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Headline</label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Superb Heavyweight Material"
                  style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Your Experience</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share details about fit, comfort and delivery..."
                  style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  style={{ flex: 1, backgroundColor: '#27272a', color: '#cbd5e1', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
