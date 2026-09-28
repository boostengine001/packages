import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';


import {
  CartItem,
  PincodeInfo,
  PlacedOrder,
  StoreSettings,
  CustomerDetails,
  IndianGstBreakdown,
} from '../types/store';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: import.meta.env.VITE_STORE_NAME || 'My Store',
  storeTagline: 'Quality Products Delivered To Your Doorstep',
  logoUrl: '',
  supportEmail: '',
  contactEmail: '',
  supportPhone: '',
  phone: '',
  whatsapp: '',
  storeAddress: '',
  gstin: '',
  theme: 'dark',
  primaryColor: '#e11d48',
  primaryColorDark: '#be123c',
  footerDescription: 'Modern Direct-to-Consumer digital storefront.',
  privacyPolicy: 'We value your privacy and only process essential order fulfillment data.',
  termsAndConditions: 'All orders processed in accordance with e-commerce standards.',
  refundPolicy: 'Hassle-free doorstep replacement or exchange for eligible orders.',
  shippingPolicy: 'Dispatched promptly with end-to-end tracking updates.',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  defaultShippingFee: 0,
  enableCod: true,
  isCodEnabled: true,
  isRazorpayEnabled: true,
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  socials: {
    instagram: '',
    facebook: '',
    twitter: '',
  },
};


const PINCODE_MAP: Record<string, { city: string; state: string; days: string }> = {
  '11': { city: 'New Delhi', state: 'Delhi', days: 'Tomorrow, by 2 PM' },
  '40': { city: 'Mumbai', state: 'Maharashtra', days: '2-3 Business Days' },
  '56': { city: 'Bengaluru', state: 'Karnataka', days: '2-3 Business Days' },
  '60': { city: 'Chennai', state: 'Tamil Nadu', days: '3-4 Business Days' },
  '70': { city: 'Kolkata', state: 'West Bengal', days: '3-4 Business Days' },
  '50': { city: 'Hyderabad', state: 'Telangana', days: '2-3 Business Days' },
  '30': { city: 'Jaipur', state: 'Rajasthan', days: '2 Business Days' },
  '38': { city: 'Ahmedabad', state: 'Gujarat', days: '2-3 Business Days' },
  '20': { city: 'Lucknow', state: 'Uttar Pradesh', days: '2-3 Business Days' },
  '41': { city: 'Pune', state: 'Maharashtra', days: '2-3 Business Days' },
};

export function lookupPincode(pin: string): PincodeInfo {
  const clean = pin.trim().replace(/\D/g, '');
  const prefix = clean.slice(0, 2);
  const found = PINCODE_MAP[prefix];
  if (found) {
    return {
      pincode: clean,
      city: found.city,
      state: found.state,
      days: found.days,
      serviceable: true,
      codAvailable: true,
      estimatedDays: found.days.includes('Tomorrow') ? 1 : 2,
    };
  }
  return {
    pincode: clean,
    city: 'Local Region',
    state: 'India',
    days: '3-5 Business Days',
    serviceable: clean.length === 6,
    codAvailable: true,
    estimatedDays: 4,
  };
}

export function computeIndianGst(totalAmount: number, customerState: string): IndianGstBreakdown {
  const storeState = 'DL';
  const isIntra = customerState.trim().toUpperCase() === storeState || customerState.trim().toLowerCase().includes('delhi');
  const baseValue = totalAmount / 1.18;
  const totalGst = Math.round((totalAmount - baseValue) * 100) / 100;

  if (isIntra) {
    const half = Math.round((totalGst / 2) * 100) / 100;
    return {
      taxType: 'INTRA_STATE',
      cgst: half,
      sgst: totalGst - half,
      igst: 0,
      totalGst,
    };
  }
  return {
    taxType: 'INTER_STATE',
    cgst: 0,
    sgst: 0,
    igst: totalGst,
    totalGst,
  };
}

interface StoreContextType {
  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isLiveApi: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  updateQuantity: (id: string, size: string | undefined, delta: number) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (product: Product, size?: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Coupons
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string | null;
  discountPercent: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Shipping & Pincode
  deliveryPincode: string;
  setDeliveryPincode: (pin: string) => void;
  pincodeInfo: PincodeInfo;
  verifyPincode: (pin: string) => Promise<PincodeInfo>;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Orders
  placedOrders: PlacedOrder[];
  createOrder: (orderPayload: {
    customer: CustomerDetails;
    paymentMethod: 'online' | 'cod';
    paymentStatus?: 'paid' | 'pending' | 'cod_pending';
  }) => Promise<{ success: boolean; orderId: string; order?: PlacedOrder; error?: string }>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);


  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Sync directly with backend API
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      fetch(`${apiBase}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: updated.storeName,
          tagline: updated.storeTagline,
          logoUrl: updated.logoUrl,
          supportEmail: updated.supportEmail,
          contactEmail: updated.contactEmail || updated.supportEmail,
          supportPhone: updated.supportPhone,
          phone: updated.phone || updated.supportPhone,
          whatsapp: updated.whatsapp,
          storeAddress: updated.storeAddress,
          gstin: updated.gstin,
          theme: updated.theme,
          primaryColor: updated.primaryColor,
          primaryColorDark: updated.primaryColorDark,
          footerDescription: updated.footerDescription,
          privacyPolicy: updated.privacyPolicy,
          termsAndConditions: updated.termsAndConditions,
          refundPolicy: updated.refundPolicy,
          shippingPolicy: updated.shippingPolicy,
          freeShippingThreshold: updated.freeShippingThreshold,
          defaultShippingFee: updated.defaultShippingFee,
          codEnabled: updated.enableCod,
          isCodEnabled: updated.isCodEnabled ?? updated.enableCod,
          razorpayEnabled: updated.isRazorpayEnabled ?? true,
          socials: updated.socials,
        }),
      }).catch(() => {});
      return updated;
    });
  };

  // 1. Cart (In-Memory State - No localStorage)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 2. Wishlist (In-Memory State - No localStorage)
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // 3. UI & Checkout States
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryPincode, setDeliveryPincode] = useState<string>('110001');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo>(() => lookupPincode('110001'));
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // 4. Placed Orders History (In-Memory State - Synced from Backend /api/orders)
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  // Fetch Live Settings & Products on Startup
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

    // Fetch Products
    fetch(`${apiBase}/products`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          setIsLiveApi(true);
        }

      })
      .catch(() => {});

    // Fetch Public Settings
    fetch(`${apiBase}/settings`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            storeName: data.settings.storeName || prev.storeName,
            storeTagline: data.settings.storeTagline || data.settings.tagline || prev.storeTagline,
            logoUrl: data.settings.logoUrl || prev.logoUrl,
            supportEmail: data.settings.supportEmail || data.settings.contactEmail || prev.supportEmail,
            supportPhone: data.settings.supportPhone || data.settings.phone || prev.supportPhone,
            phone: data.settings.phone || prev.phone,
            whatsapp: data.settings.whatsapp || prev.whatsapp,
            storeAddress: data.settings.storeAddress || prev.storeAddress,
            gstin: data.settings.gstin || prev.gstin,
            theme: data.settings.theme || prev.theme,
            primaryColor: data.settings.primaryColor || prev.primaryColor,
            primaryColorDark: data.settings.primaryColorDark || prev.primaryColorDark,
            footerDescription: data.settings.footerDescription || prev.footerDescription,
            privacyPolicy: data.settings.privacyPolicy || prev.privacyPolicy,
            termsAndConditions: data.settings.termsAndConditions || prev.termsAndConditions,
            refundPolicy: data.settings.refundPolicy || prev.refundPolicy,
            shippingPolicy: data.settings.shippingPolicy || prev.shippingPolicy,
            currency: data.settings.currency || prev.currency,
            currencySymbol: data.settings.currencySymbol || prev.currencySymbol,
            freeShippingThreshold: data.settings.freeShippingThreshold ?? prev.freeShippingThreshold,
            defaultShippingFee: data.settings.defaultShippingFee ?? prev.defaultShippingFee,
            enableCod: data.settings.isCodEnabled ?? data.settings.enableCod ?? prev.enableCod,
            isCodEnabled: data.settings.isCodEnabled ?? prev.isCodEnabled,
            isRazorpayEnabled: data.settings.isRazorpayEnabled ?? prev.isRazorpayEnabled,
            razorpayKeyId: data.settings.razorpayKeyId || prev.razorpayKeyId,
            socials: data.settings.socials || prev.socials,
          }));
        }
      })
      .catch(() => {});


    // Fetch Orders from Backend into memory
    fetch(`${apiBase}/orders`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          setPlacedOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  // Update pincode lookup
  useEffect(() => {
    setPincodeInfo(lookupPincode(deliveryPincode));
  }, [deliveryPincode]);

  const verifyPincode = async (pin: string): Promise<PincodeInfo> => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${apiBase}/shipping/pincode/${pin.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pincodeInfo) {
          const info: PincodeInfo = {
            pincode: pin,
            city: data.pincodeInfo.city || 'Metro Hub',
            state: data.pincodeInfo.state || 'India',
            days: `${data.pincodeInfo.estimatedDays || 2} Days Express`,
            serviceable: Boolean(data.pincodeInfo.serviceable),
            codAvailable: Boolean(data.pincodeInfo.codAvailable),
            estimatedDays: data.pincodeInfo.estimatedDays || 2,
          };
          setPincodeInfo(info);
          return info;
        }
      }
    } catch {
      // Fallback
    }
    const fallback = lookupPincode(pin);
    setPincodeInfo(fallback);
    return fallback;
  };

  // Cart Functions
  const addToCart = (product: Product, size?: string, color?: string) => {
    const chosenSize = size || product.sizes?.[0] || 'Free Size';
    const chosenColor = color || product.colors?.[0] || 'Default';

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === chosenSize && item.color === chosenColor
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === chosenSize && item.color === chosenColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size: chosenSize, color: chosenColor }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id && item.size === size) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === id && (size ? item.size === size : true))));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscount = Math.round((cartSubtotal * discountPercent) / 100);
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Wishlist Functions
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const moveToCart = (product: Product, size?: string) => {
    addToCart(product, size);
    removeFromWishlist(product.id);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Coupons
  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${apiBase}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized, subtotal: cartSubtotal }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.coupon) {
          const pct = data.coupon.discountPercent || 20;
          setDiscountPercent(pct);
          setAppliedCoupon(normalized);
          setCouponCode(normalized);
          return { success: true, message: `Coupon ${normalized} applied! ${pct}% OFF` };
        }
      }
    } catch {
      // Error handling
    }

    return {
      success: false,
      message: 'Invalid or expired coupon code.',
    };
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Order Placement
  const createOrder = async (orderPayload: {
    customer: CustomerDetails;
    paymentMethod: 'online' | 'cod';
    paymentStatus?: 'paid' | 'pending' | 'cod_pending';
  }): Promise<{ success: boolean; orderId: string; order?: PlacedOrder; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, orderId: '', error: 'Your cart is empty' };
    }

    const gst = computeIndianGst(cartTotal, orderPayload.customer.state || orderPayload.customer.city);
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
      selectedSize: item.size,
      selectedColor: item.color,
      image: item.product.image,
    }));

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    let generatedOrderId = 'BST-' + Math.floor(100000 + Math.random() * 900000);
    let finalOrderData: PlacedOrder = {
      orderId: generatedOrderId,
      customer: orderPayload.customer,
      items: orderItems,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingFee: 0,
      gst,
      totalAmount: cartTotal,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentStatus || (orderPayload.paymentMethod === 'online' ? 'paid' : 'cod_pending'),
      orderStatus: 'placed',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: orderPayload.customer,
          items: orderItems,
          subtotal: cartSubtotal,
          discount: cartDiscount,
          shippingFee: 0,
          totalAmount: cartTotal,
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: finalOrderData.paymentStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order && data.order.orderId) {
          generatedOrderId = data.order.orderId;
          finalOrderData = { ...finalOrderData, ...data.order, orderId: generatedOrderId };
        }
      }
    } catch {
      // In-memory fallback if backend is unreachable
    }

    setPlacedOrders((prev) => [finalOrderData, ...prev]);
    clearCart();

    return {
      success: true,
      orderId: generatedOrderId,
      order: finalOrderData,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        isLiveApi,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        isInWishlist,
        couponCode,
        setCouponCode,
        appliedCoupon,
        discountPercent,
        applyCoupon,
        removeCoupon,
        deliveryPincode,
        setDeliveryPincode,
        pincodeInfo,
        verifyPincode,
        settings,
        updateSettings,
        placedOrders,
        createOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
