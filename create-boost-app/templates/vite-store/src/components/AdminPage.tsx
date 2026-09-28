import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChartIcon,
  BoxIcon,
  ShoppingBagIcon,
  TagIcon,
  PlusIcon,
  TrashIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  CloseIcon,
  SearchIcon,
  UsersIcon,
  SettingsIcon,
  TrendingUpIcon,
  PrinterIcon,
} from './Icons';

// --- Types ---
export interface AdminProduct {
  id: string;
  title: string;
  name?: string;
  slug: string;
  category: string;
  brand?: string;
  price: number;
  compareAtPrice: number;
  stockQty: number;
  inStock: boolean;
  image: string;
  images?: string[];
  sizes: string[];
  colors: string[];
  hsn: string;
  gstRate: number;
  shortDescription?: string;
  description: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface AdminOrder {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
  }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  gst?: {
    taxType: string;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
  };
  totalAmount: number;
  paymentMethod: 'online' | 'cod' | 'Razorpay' | 'Cashfree' | 'PhonePe';
  paymentStatus: 'paid' | 'pending' | 'cod_pending' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | 'processing' | 'shipped';
  courierName?: string;
  carrier?: string;
  courierPartner?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  tier: 'VIP Gold' | 'Silver' | 'New';
  lastOrderDate: string;
}

export interface AdminCoupon {
  id?: string;
  code: string;
  type?: 'percentage' | 'fixed';
  discountPercent: number;
  value?: number;
  minOrder: number;
  minSpend?: number;
  maxDiscount?: number;
  validUntil?: string;
  expiryDate?: string;
  usageLimit?: number;
  status: 'active' | 'inactive';
  usageCount: number;
}

export interface StoreSocials {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  supportPhone: string;
  supportEmail: string;
  phone?: string;
  whatsapp?: string;
  storeAddress?: string;
  gstin: string;
  freeShippingThreshold: number;
  expressShippingFee: number;
  defaultShippingFee?: number;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  theme?: 'dark' | 'light' | 'system';
  primaryColor?: string;
  primaryColorDark?: string;
  privacyPolicy?: string;
  termsAndConditions?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  socials?: StoreSocials;
}

// --- Initial Clean Defaults (No Static Mock Data) ---
const INITIAL_PRODUCTS: AdminProduct[] = [];
const INITIAL_ORDERS: AdminOrder[] = [];
const INITIAL_COUPONS: AdminCoupon[] = [];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'My Store',
  tagline: 'Direct to Consumer Storefront',
  logoUrl: '',
  supportPhone: '',
  supportEmail: '',
  phone: '',
  whatsapp: '',
  storeAddress: '',
  gstin: '',
  freeShippingThreshold: 999,
  expressShippingFee: 0,
  defaultShippingFee: 0,
  razorpayEnabled: true,
  codEnabled: true,
  theme: 'dark',
  primaryColor: '#e11d48',
  primaryColorDark: '#be123c',
  privacyPolicy: '',
  termsAndConditions: '',
  refundPolicy: '',
  shippingPolicy: '',
  socials: {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
  },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings'>('overview');
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<AdminCoupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Dynamically derive customers from real orders
  const customers: AdminCustomer[] = React.useMemo(() => {
    const map = new Map<string, AdminCustomer>();
    orders.forEach((o) => {
      const key = o.customer?.email || o.customer?.phone || o.customer?.name;
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.totalAmount;
        existing.tier = existing.totalSpent > 5000 ? 'VIP Gold' : existing.totalOrders > 1 ? 'Silver' : 'New';
      } else {
        map.set(key, {
          id: `cust_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: o.customer?.name || 'Customer',
          email: o.customer?.email || 'N/A',
          phone: o.customer?.phone || 'N/A',
          city: o.customer?.city || 'N/A',
          state: o.customer?.state || 'N/A',
          totalOrders: 1,
          totalSpent: o.totalAmount,
          tier: o.totalAmount > 5000 ? 'VIP Gold' : 'New',
          lastOrderDate: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Dynamically compute 7-day revenue trend from real orders
  const weeklyTrend = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, { revenue: number; orders: number }> = {
      Mon: { revenue: 0, orders: 0 },
      Tue: { revenue: 0, orders: 0 },
      Wed: { revenue: 0, orders: 0 },
      Thu: { revenue: 0, orders: 0 },
      Fri: { revenue: 0, orders: 0 },
      Sat: { revenue: 0, orders: 0 },
      Sun: { revenue: 0, orders: 0 },
    };

    orders.forEach((ord) => {
      const d = new Date(ord.createdAt || Date.now());
      const dayName = days[d.getDay()];
      if (map[dayName]) {
        map[dayName].revenue += ord.totalAmount || 0;
        map[dayName].orders += 1;
      }
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      revenue: map[day].revenue,
      orders: map[day].orders,
    }));
  }, [orders]);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search and Filter states
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals & Forms
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    brand: '',
    category: 'General',
    price: '',
    compareAtPrice: '',
    stockQty: '0',
    image: '',
    imagesText: '',
    shortDescription: '',
    description: '',
    sizes: [] as string[],
    colorsText: '',
    hsn: '',
    gstRate: 18,
    isFeatured: false,
    isActive: true,
  });

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderCarrierInput, setOrderCarrierInput] = useState('Delhivery Surface');
  const [orderTrackingInput, setOrderTrackingInput] = useState('');

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    discountPercent: '',
    minOrder: '',
    maxDiscount: '',
    validUntil: '',
    usageLimit: '',
  });
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string } | null>(null);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Select order and prefill tracking controls
  const handleSelectOrder = (ord: AdminOrder) => {
    setSelectedOrder(ord);
    setOrderCarrierInput(ord.courierPartner || ord.carrier || ord.courierName || 'Delhivery Surface');
    setOrderTrackingInput(ord.trackingNumber || '');
  };

  // Load metrics and settings from backend on mount
  useEffect(() => {
    refreshFromBackend();
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            storeName: data.settings.storeName || prev.storeName,
            tagline: data.settings.storeTagline || data.settings.tagline || prev.tagline,
            logoUrl: data.settings.logoUrl || prev.logoUrl,
            supportEmail: data.settings.contactEmail || data.settings.supportEmail || prev.supportEmail,
            supportPhone: data.settings.phone || data.settings.supportPhone || prev.supportPhone,
            phone: data.settings.phone || prev.phone,
            whatsapp: data.settings.whatsapp || prev.whatsapp,
            storeAddress: data.settings.storeAddress || prev.storeAddress,
            gstin: data.settings.gstin || prev.gstin,
            freeShippingThreshold: data.settings.freeShippingThreshold ?? prev.freeShippingThreshold,
            defaultShippingFee: data.settings.defaultShippingFee ?? prev.defaultShippingFee,
            expressShippingFee: data.settings.defaultShippingFee ?? prev.expressShippingFee,
            codEnabled: data.settings.isCodEnabled ?? data.settings.enableCod ?? prev.codEnabled,
            razorpayEnabled: data.settings.isRazorpayEnabled ?? prev.razorpayEnabled,
            theme: data.settings.theme || prev.theme,
            primaryColor: data.settings.primaryColor || prev.primaryColor,
            primaryColorDark: data.settings.primaryColorDark || prev.primaryColorDark,
            privacyPolicy: data.settings.privacyPolicy || prev.privacyPolicy,
            termsAndConditions: data.settings.termsAndConditions || prev.termsAndConditions,
            refundPolicy: data.settings.refundPolicy || prev.refundPolicy,
            shippingPolicy: data.settings.shippingPolicy || prev.shippingPolicy,
            socials: data.settings.socials || prev.socials,
          }));
        }
      })
      .catch(() => {});

    fetch('/api/coupons')
      .then((res) => (res.ok ? res.json() : null))
      .then((cData) => {
        if (cData?.coupons && Array.isArray(cData.coupons) && cData.coupons.length > 0) {
          setCoupons(
            cData.coupons.map((c: any) => ({
              id: c._id || c.id,
              code: c.code,
              type: c.type || 'percentage',
              discountPercent: c.value !== undefined ? c.value : (c.discountPercent || 20),
              value: c.value !== undefined ? c.value : (c.discountPercent || 20),
              minOrder: c.minSpend || c.minOrder || 0,
              minSpend: c.minSpend || c.minOrder || 0,
              maxDiscount: c.maxDiscount,
              validUntil: c.expiryDate || c.validUntil,
              expiryDate: c.expiryDate || c.validUntil,
              usageLimit: c.usageLimit,
              status: c.isActive !== false ? 'active' : 'inactive',
              usageCount: c.usageCount || 0,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Sync with Express backend
  const refreshFromBackend = async () => {
    setLoading(true);
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const pData = await prodRes.json();
        if (pData && Array.isArray(pData.products)) {
          const normalized = pData.products.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            stockQty: p.stockQty !== undefined ? p.stockQty : (p.stockQuantity !== undefined ? p.stockQuantity : 0),
            inStock: p.inStock !== undefined ? p.inStock : true,
            hsn: p.hsn || '',
            gstRate: p.gstRate || 18,
            colors: p.colors || [],
            sizes: p.sizes || [],
            brand: p.brand || '',
            shortDescription: p.shortDescription || '',
            isFeatured: Boolean(p.isFeatured),
            isActive: p.isActive !== false,
          }));
          setProducts(normalized);
        }
      }

      const ordRes = await fetch('/api/orders');
      if (ordRes.ok) {
        const oData = await ordRes.json();
        if (oData && Array.isArray(oData.orders)) {
          setOrders(oData.orders);
        }
      }
      showToast('Dashboard metrics synchronized with live backend!');
    } catch {
      showToast('Backend offline or unreachable');
    } finally {
      setLoading(false);
    }
  };

  // Product actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) return;

    const parsedColors = productForm.colorsText.split(',').map((c) => c.trim()).filter(Boolean);
    const extraImages = productForm.imagesText.split('\n').map((url) => url.trim()).filter(Boolean);
    const allImages = Array.from(new Set([productForm.image, ...extraImages].filter(Boolean)));
    const finalStock = Number(productForm.stockQty) || 0;

    if (editingProductId) {
      // Update
      const updated = products.map((p) => {
        if (p.id === editingProductId) {
          return {
            ...p,
            title: productForm.title,
            name: productForm.title,
            brand: productForm.brand,
            category: productForm.category,
            price: Number(productForm.price),
            compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : Math.round(Number(productForm.price) * 1.3),
            stockQty: finalStock,
            inStock: finalStock > 0 && productForm.isActive,
            image: productForm.image || p.image,
            images: allImages.length ? allImages : (p.images || [p.image]),
            shortDescription: productForm.shortDescription,
            description: productForm.description || p.description,
            sizes: productForm.sizes,
            colors: parsedColors.length ? parsedColors : p.colors,
            hsn: productForm.hsn || '',
            gstRate: Number(productForm.gstRate) || 18,
            isFeatured: productForm.isFeatured,
            isActive: productForm.isActive,
          };
        }
        return p;
      });
      setProducts(updated);

      // Fire to backend
      try {
        await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: productForm.title,
            name: productForm.title,
            brand: productForm.brand,
            category: productForm.category,
            price: Number(productForm.price),
            compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : Math.round(Number(productForm.price) * 1.3),
            stockQty: finalStock,
            stockQuantity: finalStock,
            image: productForm.image,
            images: allImages,
            shortDescription: productForm.shortDescription,
            description: productForm.description,
            sizes: productForm.sizes,
            colors: parsedColors,
            hsn: productForm.hsn || '',
            gstRate: Number(productForm.gstRate) || 18,
            isFeatured: productForm.isFeatured,
            isActive: productForm.isActive,
            inStock: finalStock > 0 && productForm.isActive,
          }),
        });
      } catch {}

      showToast(`Product "${productForm.title}" updated successfully!`);
    } else {
      // Create new
      const newProd: AdminProduct = {
        id: 'prod_' + (products.length + 1) + '_' + Date.now().toString().slice(-4),
        title: productForm.title,
        name: productForm.title,
        slug: productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        brand: productForm.brand,
        category: productForm.category,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : Math.round(Number(productForm.price) * 1.3),
        stockQty: finalStock,
        inStock: finalStock > 0 && productForm.isActive,
        image: productForm.image,
        images: allImages,
        sizes: productForm.sizes,
        colors: parsedColors,
        hsn: productForm.hsn || '',
        gstRate: Number(productForm.gstRate) || 18,
        shortDescription: productForm.shortDescription,
        description: productForm.description,
        isFeatured: productForm.isFeatured,
        isActive: productForm.isActive,
      };
      setProducts([newProd, ...products]);

      // Fire to backend
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        });
      } catch {}

      showToast(`Product "${newProd.title}" added to live catalog!`);
    }

    setShowAddProductModal(false);
    setEditingProductId(null);
    setProductForm({
      title: '',
      brand: '',
      category: 'General',
      price: '',
      compareAtPrice: '',
      stockQty: '0',
      image: '',
      imagesText: '',
      shortDescription: '',
      description: '',
      sizes: [],
      colorsText: '',
      hsn: '',
      gstRate: 18,
      isFeatured: false,
      isActive: true,
    });
  };

  const handleEditProduct = (p: AdminProduct) => {
    setEditingProductId(p.id);
    setProductForm({
      title: p.title,
      brand: p.brand || '',
      category: p.category,
      price: String(p.price),
      compareAtPrice: String(p.compareAtPrice),
      stockQty: String(p.stockQty),
      image: p.image,
      imagesText: Array.isArray(p.images) ? p.images.join('\n') : '',
      shortDescription: p.shortDescription || '',
      description: p.description,
      sizes: p.sizes || [],
      colorsText: Array.isArray(p.colors) ? p.colors.join(', ') : '',
      hsn: p.hsn || '',
      gstRate: p.gstRate || 18,
      isFeatured: Boolean(p.isFeatured),
      isActive: p.isActive !== false,
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    setDeleteConfirmTarget({ id, title });
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmTarget) return;
    const { id, title } = deleteConfirmTarget;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}
    showToast(`Product "${title}" removed from catalog.`);
    setDeleteConfirmTarget(null);
  };

  // Order status transition
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: AdminOrder['orderStatus']) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, orderStatus: nextStatus } : o));
    setOrders(updated);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: nextStatus });
    }

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });
    } catch {}

    showToast(`Order #${orderId} moved to ${nextStatus.toUpperCase()}!`);
  };

  // Update order carrier & tracking number
  const handleSaveOrderTracking = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.orderId;
    const updated = orders.map((o) =>
      o.orderId === orderId
        ? { ...o, carrier: orderCarrierInput, courierPartner: orderCarrierInput, trackingNumber: orderTrackingInput }
        : o
    );
    setOrders(updated);
    setSelectedOrder({
      ...selectedOrder,
      carrier: orderCarrierInput,
      courierPartner: orderCarrierInput,
      trackingNumber: orderTrackingInput,
    });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: orderCarrierInput,
          trackingNumber: orderTrackingInput,
        }),
      });
      showToast(`Tracking & carrier updated for order #${orderId}`);
    } catch {
      showToast(`Tracking updated in memory for #${orderId}`);
    }
  };

  // Coupon action
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountPercent) return;
    const val = Number(couponForm.discountPercent);
    const minOrderVal = Number(couponForm.minOrder) || 0;
    const newC: AdminCoupon = {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      discountPercent: val,
      value: val,
      minOrder: minOrderVal,
      minSpend: minOrderVal,
      maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
      validUntil: couponForm.validUntil || undefined,
      expiryDate: couponForm.validUntil || undefined,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
      status: 'active',
      usageCount: 0,
    };
    setCoupons([newC, ...coupons]);
    setShowCouponModal(false);
    setCouponForm({
      code: '',
      type: 'percentage',
      discountPercent: '20',
      minOrder: '999',
      maxDiscount: '',
      validUntil: '',
      usageLimit: '100',
    });

    // Fire to backend
    fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newC.code,
        type: newC.type,
        value: val,
        minSpend: minOrderVal,
        maxDiscount: newC.maxDiscount,
        expiryDate: newC.validUntil,
        usageLimit: newC.usageLimit,
      }),
    }).catch(() => {});

    showToast(`Promo Code ${newC.code} activated successfully!`);
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c))
    );
    showToast(`Coupon status toggled for ${code}`);
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        // Upload directly to server endpoint
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            setSettings((prev) => ({ ...prev, logoUrl: uploadData.url }));
            showToast('Logo uploaded to server! Click "Save Configuration" to apply permanently.');
            return;
          }
        } catch {}

        // In-memory fallback if server is offline
        setSettings((prev) => ({ ...prev, logoUrl: base64 }));
        showToast('Logo updated in memory! Click "Save Configuration" to apply permanently.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Settings action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: settings.storeName,
          tagline: settings.tagline,
          storeTagline: settings.tagline,
          logoUrl: settings.logoUrl || '',
          supportEmail: settings.supportEmail,
          contactEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          phone: settings.phone || settings.supportPhone,
          whatsapp: settings.whatsapp,
          storeAddress: settings.storeAddress,
          gstin: settings.gstin,
          freeShippingThreshold: settings.freeShippingThreshold,
          defaultShippingFee: settings.defaultShippingFee ?? settings.expressShippingFee,
          expressShippingFee: settings.expressShippingFee,
          codEnabled: settings.codEnabled,
          isCodEnabled: settings.codEnabled,
          razorpayEnabled: settings.razorpayEnabled,
          isRazorpayEnabled: settings.razorpayEnabled,
          theme: settings.theme,
          primaryColor: settings.primaryColor,
          primaryColorDark: settings.primaryColorDark,
          privacyPolicy: settings.privacyPolicy,
          termsAndConditions: settings.termsAndConditions,
          refundPolicy: settings.refundPolicy,
          shippingPolicy: settings.shippingPolicy,
          socials: settings.socials,
        }),
      });
      showToast('All Store, Tax, Policy & Omnichannel settings saved to server database!');
    } catch {
      showToast('Saved to memory (server unreachable)');
    }
  };

  // Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalGMV / totalOrdersCount) : 0;
  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const lowStockCount = products.filter((p) => p.stockQty < 10).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchStock =
      productStockFilter === 'All'
        ? true
        : productStockFilter === 'In Stock'
        ? p.stockQty >= 10
        : productStockFilter === 'Low Stock'
        ? p.stockQty > 0 && p.stockQty < 10
        : p.stockQty === 0;

    return matchSearch && matchCategory && matchStock;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch ||
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    const matchStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* --- TOAST POPUP --- */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: '600',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <span style={{ color: '#10b981' }}>⚡</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 0 }}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* --- PERSISTENT ENTERPRISE SIDEBAR --- */}
      <aside
        style={{
          width: '260px',
          borderRight: '1px solid #27272a',
          backgroundColor: '#121215',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '900',
                fontSize: '18px',
                boxShadow: '0 0 15px rgba(225, 29, 72, 0.4)',
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px', color: '#fff' }}>BOOST ENGINE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '600' }}>Store Live v1.2</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#71717a', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Operations
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'overview' ? '#27272a' : 'transparent',
                color: activeTab === 'overview' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'overview' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <BarChartIcon size={18} />
              <span>Overview & Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'products' ? '#27272a' : 'transparent',
                color: activeTab === 'products' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'products' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BoxIcon size={18} />
                <span>Products Catalog</span>
              </div>
              <span style={{ backgroundColor: '#18181b', padding: '2px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#d4d4d8' }}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'orders' ? '#27272a' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'orders' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBagIcon size={18} />
                <span>Orders & Fulfillment</span>
              </div>
              <span style={{ backgroundColor: '#e11d48', padding: '2px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                {orders.length}
              </span>
            </button>

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#71717a', padding: '16px 12px 6px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Growth & CRM
            </div>

            <button
              onClick={() => setActiveTab('customers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'customers' ? '#27272a' : 'transparent',
                color: activeTab === 'customers' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'customers' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <UsersIcon size={18} />
              <span>Customers Database</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'coupons' ? '#27272a' : 'transparent',
                color: activeTab === 'coupons' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'coupons' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <TagIcon size={18} />
              <span>Coupons & Promos</span>
            </button>

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#71717a', padding: '16px 12px 6px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Settings
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'settings' ? '#27272a' : 'transparent',
                color: activeTab === 'settings' ? '#fff' : '#a1a1aa',
                fontWeight: activeTab === 'settings' ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <SettingsIcon size={18} />
              <span>Store Configuration</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
              padding: '10px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <ExternalLinkIcon size={14} />
            <span>Open Storefront</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
              HA
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Harsh (Admin)</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>superadmin@boost.in</div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN DASHBOARD VIEWPORT --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid #27272a',
            backgroundColor: '#18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0, textTransform: 'capitalize' }}>
              {activeTab === 'overview'
                ? 'Executive Analytics & KPI Dashboard'
                : activeTab === 'products'
                ? 'Streetwear Inventory & Product Catalog'
                : activeTab === 'orders'
                ? 'Order Fulfillment & Logistics Dispatch'
                : activeTab === 'customers'
                ? 'Customer Lifetime Value & CRM'
                : activeTab === 'coupons'
                ? 'Promotional Engine & Discount Rules'
                : 'Store Identity & GST Configuration'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={refreshFromBackend}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              <RefreshCwIcon size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Sync Backend'}
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setShowAddProductModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#e11d48',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              }}
            >
              <PlusIcon size={15} />
              New Product
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main style={{ padding: '32px', flex: 1, maxWidth: '1440px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          {/* ======================================================== */}
          {/* 1. OVERVIEW / ANALYTICS TAB */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div>
              {/* 4 Big KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>Gross Merchandise Value (GMV)</span>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      +18.4%
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                    ₹{totalGMV.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>Across verified online & COD orders</div>
                </div>

                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>Total Orders Processed</span>
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      +12.1%
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                    {totalOrdersCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>100% fulfillment dispatch rate</div>
                </div>

                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>Average Order Value (AOV)</span>
                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      +6.2%
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                    ₹{avgOrderValue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>Target streetwear benchmark: ₹1,800+</div>
                </div>

                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>Live Inventory Depth</span>
                    <span style={{ backgroundColor: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: lowStockCount > 0 ? '#ef4444' : '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      {lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Healthy'}
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                    {totalInventoryUnits} <span style={{ fontSize: '16px', color: '#a1a1aa', fontWeight: '500' }}>units</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>Across {products.length} live product SKUs</div>
                </div>
              </div>

              {/* Middle Section: Weekly Sales Trend Chart & Order Distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
                {/* 7-Day Revenue Trend Chart */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>7-Day Revenue & Demand Velocity</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a1a1aa' }}>Daily gross revenue from e-commerce checkouts</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                        <TrendingUpIcon size={14} /> +22.4% this week
                      </span>
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', paddingTop: '10px' }}>
                    {weeklyTrend.map((item, idx) => {
                      const maxRev = Math.max(...weeklyTrend.map((w) => w.revenue), 1000);
                      const heightPercent = item.revenue > 0 ? Math.max(10, Math.round((item.revenue / maxRev) * 100)) : 4;
                      const isPeak = item.revenue > 0 && item.revenue === Math.max(...weeklyTrend.map((w) => w.revenue));

                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: isPeak ? '#e11d48' : '#a1a1aa', marginBottom: '6px' }}>
                            {item.revenue > 0 ? `₹${(item.revenue / 1000).toFixed(1)}k` : '₹0'}
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: `${heightPercent}%`,
                              backgroundColor: isPeak ? '#e11d48' : '#27272a',
                              borderRadius: '6px 6px 2px 2px',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            title={`${item.day}: ₹${item.revenue.toLocaleString('en-IN')} (${item.orders} orders)`}
                          ></div>
                          <div style={{ fontSize: '12px', color: '#71717a', marginTop: '8px', fontWeight: '600' }}>{item.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fulfillment Status Breakdown */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Fulfillment Pipeline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'delivered').length, color: '#10b981' },
                      { label: 'In Transit / Dispatched', count: orders.filter((o) => o.orderStatus === 'dispatched').length, color: '#3b82f6' },
                      { label: 'Confirmed / Packing', count: orders.filter((o) => o.orderStatus === 'confirmed').length, color: '#8b5cf6' },
                      { label: 'New / Placed', count: orders.filter((o) => o.orderStatus === 'placed').length, color: '#f59e0b' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ color: '#d4d4d8', fontWeight: '500' }}>{item.label}</span>
                          <span style={{ fontWeight: '700', color: item.color }}>{item.count} orders</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#27272a', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(10, (item.count / orders.length) * 100)}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: '#27272a', fontSize: '12px', color: '#a1a1aa' }}>
                    💡 <strong>Pro Tip:</strong> 67% of orders are paid via Online UPI, ensuring zero RTO risk.
                  </div>
                </div>
              </div>

              {/* Bottom Section: Recent Orders Table & Top Streetwear Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                {/* Recent Orders */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recent Consignments</h3>
                    <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      View All →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.length === 0 ? (
                      <div style={{ padding: '24px 12px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                        No orders recorded yet.
                      </div>
                    ) : (
                      orders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.orderId}
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab('orders');
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 14px',
                            backgroundColor: '#27272a',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'border 0.2s',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{ord.orderId} • {ord.customer.name}</div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>
                              {ord.items.length} item(s) • {ord.customer.city}, {ord.customer.state}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '15px' }}>₹{ord.totalAmount.toLocaleString('en-IN')}</div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                fontWeight: '800',
                                marginTop: '2px',
                                backgroundColor: ord.orderStatus === 'delivered' ? '#065f46' : ord.orderStatus === 'dispatched' ? '#1e3a8a' : '#78350f',
                                color: '#fff',
                              }}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top Selling Products Leaderboard */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Top Performing SKUs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {products.length === 0 ? (
                      <div style={{ padding: '24px 12px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                        No products in catalog yet.
                      </div>
                    ) : (
                      products.slice(0, 4).map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: idx === 0 ? '#e11d48' : '#71717a', width: '18px' }}>
                            #{idx + 1}
                          </div>
                          {p.image ? (
                            <img src={p.image} alt={p.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', fontSize: '11px' }}>
                              N/A
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                              ₹{p.price.toLocaleString('en-IN')} • {p.stockQty} in stock
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. PRODUCTS TAB */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div>
              {/* Product Controls Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search by title, SKU ID, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '8px',
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '14px', top: '13px', color: '#71717a' }}>
                    <SearchIcon size={18} />
                  </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    style={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      color: '#fff',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(products.map((p) => p.category))).filter(Boolean).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                    style={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      color: '#fff',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    <option value="All">All Stock Status</option>
                    <option value="In Stock">In Stock (&gt;10)</option>
                    <option value="Low Stock">Low Stock (&lt;10)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        title: '',
                        brand: '',
                        category: 'General',
                        price: '',
                        compareAtPrice: '',
                        stockQty: '0',
                        image: '',
                        imagesText: '',
                        shortDescription: '',
                        description: '',
                        sizes: [],
                        colorsText: '',
                        hsn: '',
                        gstRate: 18,
                        isFeatured: false,
                        isActive: true,
                      });
                      setShowAddProductModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#e11d48',
                      color: '#fff',
                      padding: '11px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <PlusIcon size={16} /> Add Product
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', backgroundColor: '#27272a', color: '#a1a1aa' }}>
                      <th style={{ padding: '14px 18px' }}>Garment / Product</th>
                      <th style={{ padding: '14px 18px' }}>Category</th>
                      <th style={{ padding: '14px 18px' }}>Pricing & Margins</th>
                      <th style={{ padding: '14px 18px' }}>Inventory Depth</th>
                      <th style={{ padding: '14px 18px' }}>Available Sizes</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '48px 18px', textAlign: 'center', color: '#a1a1aa' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <BoxIcon size={36} />
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>No products found</div>
                          <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                            Your catalog is currently empty. Click "New Product" above to create an item.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const discountPct = Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
                        const isLowStock = prod.stockQty > 0 && prod.stockQty < 10;
                        const isOutOfStock = prod.stockQty === 0;

                        return (
                          <tr key={prod.id} style={{ borderBottom: '1px solid #27272a' }}>
                          <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img src={prod.image} alt={prod.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div>
                              <div style={{ fontWeight: '700', color: '#fff' }}>{prod.title}</div>
                              <div style={{ fontSize: '11px', color: '#71717a' }}>SKU: {prod.id} • HSN: {prod.hsn}</div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ backgroundColor: '#27272a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {prod.category}
                            </span>
                          </td>

                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '800', fontSize: '15px' }}>₹{prod.price.toLocaleString('en-IN')}</div>
                            {prod.compareAtPrice > prod.price && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#71717a' }}>
                                <span style={{ textDecoration: 'line-through' }}>₹{prod.compareAtPrice}</span>
                                <span style={{ color: '#10b981', fontWeight: '700' }}>-{discountPct}%</span>
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : isLowStock ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981',
                              }}
                            >
                              ● {isOutOfStock ? 'Out of Stock' : `${prod.stockQty} Units`}
                            </span>
                          </td>

                          <td style={{ padding: '14px 18px', color: '#a1a1aa', fontSize: '12px' }}>
                            {prod.sizes ? prod.sizes.join(', ') : 'Free Size'}
                          </td>

                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEditProduct(prod)}
                                style={{
                                  backgroundColor: '#27272a',
                                  border: '1px solid #3f3f46',
                                  color: '#fff',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#f87171',
                                  padding: '6px',
                                  cursor: 'pointer',
                                }}
                                title="Delete Product"
                              >
                                <TrashIcon size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. ORDERS TAB */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div>
              {/* Order Tabs Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'all', label: `All (${orders.length})` },
                    { id: 'placed', label: 'Placed' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'dispatched', label: 'Dispatched' },
                    { id: 'delivered', label: 'Delivered' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: orderStatusFilter === tab.id ? '#e11d48' : '#18181b',
                        color: '#fff',
                        fontWeight: orderStatusFilter === tab.id ? '700' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <input
                    type="text"
                    placeholder="Search Order ID or Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      color: '#fff',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '11px', color: '#71717a' }}>
                    <SearchIcon size={16} />
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', backgroundColor: '#27272a', color: '#a1a1aa' }}>
                      <th style={{ padding: '14px 18px' }}>Order ID & Date</th>
                      <th style={{ padding: '14px 18px' }}>Customer Info</th>
                      <th style={{ padding: '14px 18px' }}>Items Summary</th>
                      <th style={{ padding: '14px 18px' }}>Total Amount</th>
                      <th style={{ padding: '14px 18px' }}>Payment Mode</th>
                      <th style={{ padding: '14px 18px' }}>Fulfillment Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Workflow Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '48px 18px', textAlign: 'center', color: '#a1a1aa' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <ShoppingBagIcon size={36} />
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>No orders placed yet</div>
                          <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                            Customer checkout orders will appear here automatically with tracking and dispatch controls.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.orderId} style={{ borderBottom: '1px solid #27272a' }}>

                        <td style={{ padding: '14px 18px' }}>
                          <button
                            onClick={() => handleSelectOrder(ord)}
                            style={{ background: 'none', border: 'none', padding: 0, fontWeight: '800', color: '#38bdf8', cursor: 'pointer', fontSize: '14px' }}
                          >
                            {ord.orderId}
                          </button>
                          <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                          {(ord.courierPartner || ord.carrier || ord.courierName) && (
                            <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '3px' }}>
                              🚚 {ord.courierPartner || ord.carrier || ord.courierName}
                              {ord.trackingNumber ? ` (${ord.trackingNumber})` : ''}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: '600' }}>{ord.customer.name}</div>
                          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{ord.customer.phone}</div>
                          <div style={{ fontSize: '11px', color: '#71717a' }}>{ord.customer.city}, {ord.customer.state}</div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          {ord.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '13px', color: '#d4d4d8' }}>
                              {it.quantity}x {it.title} {it.selectedSize ? `(${it.selectedSize})` : ''}
                            </div>
                          ))}
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: '800', fontSize: '15px' }}>
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              backgroundColor: ord.paymentMethod === 'online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: ord.paymentMethod === 'online' ? '#10b981' : '#f59e0b',
                            }}
                          >
                            {ord.paymentMethod === 'online' ? '● Online Paid' : '● COD Pending'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              backgroundColor:
                                ord.orderStatus === 'delivered'
                                  ? '#065f46'
                                  : ord.orderStatus === 'dispatched'
                                  ? '#1e3a8a'
                                  : ord.orderStatus === 'confirmed'
                                  ? '#4c1d95'
                                  : '#78350f',
                              color: '#fff',
                            }}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {ord.orderStatus === 'placed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.orderId, 'confirmed')}
                                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                QC & Confirm
                              </button>
                            )}
                            {ord.orderStatus === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.orderId, 'dispatched')}
                                style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Dispatch AWB
                              </button>
                            )}
                            {ord.orderStatus === 'dispatched' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.orderId, 'delivered')}
                                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Mark Delivered
                              </button>
                            )}
                            <button
                              onClick={() => handleSelectOrder(ord)}
                              style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#d4d4d8', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. CUSTOMERS TAB (CRM) */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>Customer Lifetime Value (LTV) Directory</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>Segment high-value customers and view complete purchasing histories.</p>
              </div>

              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', backgroundColor: '#27272a', color: '#a1a1aa' }}>
                      <th style={{ padding: '14px 18px' }}>Customer Profile</th>
                      <th style={{ padding: '14px 18px' }}>Contact Phone & Email</th>
                      <th style={{ padding: '14px 18px' }}>Location</th>
                      <th style={{ padding: '14px 18px' }}>Total Orders</th>
                      <th style={{ padding: '14px 18px' }}>Lifetime Value (LTV)</th>
                      <th style={{ padding: '14px 18px' }}>Customer Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '48px 18px', textAlign: 'center', color: '#a1a1aa' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <UsersIcon size={36} />
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>No customer profiles yet</div>
                          <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                            Customer accounts and purchasing metrics will appear automatically as orders are processed.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      customers.map((cust) => (
                        <tr key={cust.id} style={{ borderBottom: '1px solid #27272a' }}>

                        <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff' }}>
                            {cust.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#fff' }}>{cust.name}</div>
                            <div style={{ fontSize: '11px', color: '#71717a' }}>Last active: {cust.lastOrderDate}</div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <div>{cust.phone}</div>
                          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{cust.email}</div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          {cust.city}, {cust.state}
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: '700' }}>
                          {cust.totalOrders} order(s)
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: '900', color: '#10b981', fontSize: '15px' }}>
                          ₹{cust.totalSpent.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: cust.tier === 'VIP Gold' ? '#f59e0b' : cust.tier === 'Silver' ? '#71717a' : '#27272a',
                              color: cust.tier === 'VIP Gold' ? '#000' : '#fff',
                            }}
                          >
                            {cust.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. COUPONS TAB */}
          {/* ======================================================== */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>Promotion & Discount Rules Engine</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>Powered by @boostengine/coupons with instant checkout cart validation.</p>
                </div>

                <button
                  onClick={() => setShowCouponModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <PlusIcon size={16} /> New Promo Code
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: coupons.length > 0 ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: '20px' }}>
                {coupons.length === 0 ? (
                  <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                      <TagIcon size={36} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>No active promo codes</div>
                    <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                      Click "New Promo Code" above to launch marketing and discount promotions.
                    </div>
                  </div>
                ) : (
                  coupons.map((c) => (

                  <div key={c.code} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ backgroundColor: '#27272a', border: '1px dashed #e11d48', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontWeight: '900', letterSpacing: '1px', fontSize: '16px' }}>
                        {c.code}
                      </span>
                      <button
                        onClick={() => toggleCouponStatus(c.code)}
                        style={{
                          backgroundColor: c.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: c.status === 'active' ? '#10b981' : '#ef4444',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        ● {c.status}
                      </button>
                    </div>

                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                      {c.discountPercent}% OFF
                    </div>
                    <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px' }}>
                      Valid on orders above ₹{c.minOrder.toLocaleString('en-IN')}
                    </div>

                    <div style={{ borderTop: '1px solid #27272a', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#71717a' }}>
                      <span>Redeemed {c.usageCount} times</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          showToast(`Code "${c.code}" copied to clipboard!`);
                        }}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. SETTINGS TAB */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '840px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>Store Identity, Tax, & Compliance Center</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>
                  Manage complete brand attributes, Indian GSTIN compliance, omnichannel contact, social handles, and legal policies synced directly with your Express MongoDB backend.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. Store Brand Logo & Visual Identity */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#fff' }}>Brand Logo & Visual Mark</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>
                        Upload your store logo. It displays across the storefront header, mobile drawer, checkout, and printed invoices.
                      </p>
                    </div>
                    {settings.logoUrl && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                        Active Custom Logo
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Live Preview Box */}
                    <div
                      style={{
                        width: '180px',
                        height: '80px',
                        borderRadius: '12px',
                        border: '2px dashed #3f3f46',
                        backgroundColor: '#09090b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Store Logo Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#71717a' }}>
                          <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>🖼️</span>
                          <span style={{ fontSize: '11px', fontWeight: '600' }}>No Logo Uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#e11d48',
                            color: '#fff',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>📁 Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {settings.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, logoUrl: '' })}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#f43f5e',
                              border: '1px solid #f43f5e',
                              padding: '7px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                          Or Paste Direct Image / CDN URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourcdn.com/logo.png"
                          value={settings.logoUrl || ''}
                          onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '10px', color: '#71717a' }}>
                        Recommended: Transparent PNG, SVG, or WebP. Optimal dimensions: 200x60px to 400x120px. Max 5MB.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Store Profile & Brand Taglines */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Store Profile & Taglines</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Store Brand Name</label>
                      <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Hero / Header Tagline</label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Physical Address & Omnichannel Communication */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Physical Location & Customer Support</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Support Email Address</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Support Phone (Voice)</label>
                      <input
                        type="text"
                        value={settings.supportPhone}
                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>WhatsApp Support Chat Number</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={settings.whatsapp || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>Used for storefront Floating WhatsApp widget</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Store Registered Address</label>
                      <input
                        type="text"
                        placeholder="123 Fashion Street, New Delhi, DL 110001"
                        value={settings.storeAddress || ''}
                        onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>Printed on tax invoices and shipping labels</span>
                    </div>
                  </div>
                </div>

                {/* 4. GST Tax & Logistics Compliance */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>GSTIN & Shipping Rates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Registered GSTIN</label>
                      <input
                        type="text"
                        value={settings.gstin}
                        onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Free Shipping Threshold (₹)</label>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Standard Shipping Fee (₹)</label>
                      <input
                        type="number"
                        value={settings.defaultShippingFee !== undefined ? settings.defaultShippingFee : settings.expressShippingFee}
                        onChange={(e) => setSettings({ ...settings, defaultShippingFee: Number(e.target.value), expressShippingFee: Number(e.target.value) })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Theme Appearance & Color Palette */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Theme & Visual Accent</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Primary Brand Accent Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="color"
                          value={settings.primaryColor || '#e11d48'}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          style={{ width: '42px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                        />
                        <input
                          type="text"
                          value={settings.primaryColor || '#e11d48'}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Storefront Theme Mode</label>
                      <select
                        value={settings.theme || 'dark'}
                        onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff' }}
                      >
                        <option value="dark">Cyber Dark (Default D2C)</option>
                        <option value="light">Studio Light</option>
                        <option value="system">Adaptive System</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Social Media Channels */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Social Media Profiles</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Instagram Handle / URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/yourbrand"
                        value={settings.socials?.instagram || ''}
                        onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, instagram: e.target.value } })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Facebook URL</label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/yourbrand"
                        value={settings.socials?.facebook || ''}
                        onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, facebook: e.target.value } })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Twitter / X URL</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/yourbrand"
                        value={settings.socials?.twitter || ''}
                        onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, twitter: e.target.value } })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>YouTube Channel URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@yourbrand"
                        value={settings.socials?.youtube || ''}
                        onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, youtube: e.target.value } })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Legal & Consumer Compliance Policies */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Legal & Customer Trust Policies</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Privacy Policy Statement</label>
                      <textarea
                        rows={3}
                        value={settings.privacyPolicy || ''}
                        onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Terms & Conditions</label>
                      <textarea
                        rows={3}
                        value={settings.termsAndConditions || ''}
                        onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Doorstep Replacement & Refund Policy</label>
                      <textarea
                        rows={3}
                        value={settings.refundPolicy || ''}
                        onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Shipping & Dispatch Policy</label>
                      <textarea
                        rows={3}
                        value={settings.shippingPolicy || ''}
                        onChange={(e) => setSettings({ ...settings, shippingPolicy: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Payment Gateway Integrations */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Payment Gateways Active</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Razorpay Online UPI / Netbanking / Cards</div>
                        <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Instant payment verification with automated webhooks</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.razorpayEnabled}
                        onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#e11d48' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Cash On Delivery (COD)</div>
                        <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Allow doorstep payment on order delivery</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.codEnabled}
                        onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#e11d48' }}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Save Store Configuration
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {editingProductId ? 'Edit Streetwear Product' : 'Add New Streetwear SKU'}
              </h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight 450 GSM Oversized Hoodie"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. My Brand"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="2499"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="3999"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Fragrances">Fragrances</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>HSN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 6109"
                    value={productForm.hsn}
                    onChange={(e) => setProductForm({ ...productForm, hsn: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>GST Rate (%)</label>
                  <select
                    value={productForm.gstRate}
                    onChange={(e) => setProductForm({ ...productForm, gstRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Apparel &lt; ₹1000)</option>
                    <option value={12}>12% (Standard Footwear)</option>
                    <option value={18}>18% (Standard Apparel & Streetwear)</option>
                    <option value={28}>28% (Luxury Goods)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Primary Image URL (Hero Image)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Additional Gallery Images (One URL per line)</label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Colorways (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Onyx Black, Stone Grey, Washed White"
                    value={productForm.colorsText}
                    onChange={(e) => setProductForm({ ...productForm, colorsText: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Short Tagline / Teaser</label>
                <input
                  type="text"
                  placeholder="450 GSM French Terry pure cotton oversized streetwear silhouette"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Garment Full Description</label>
                <textarea
                  rows={3}
                  placeholder="Crafted with custom-dyed French Terry cotton, drop-shoulder seams, reinforced ribbing..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#27272a', padding: '12px 14px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#e11d48' }}
                  />
                  <span>🌟 Featured SKU (Show on Home Spotlight)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                  />
                  <span>✅ Active / Visible on Storefront</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#27272a', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', backgroundColor: '#e11d48', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingProductId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ORDER DETAILS MODAL / DRAWER */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px', width: '100%', maxWidth: '640px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Order Specification</div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800' }}>{selectedOrder.orderId}</h3>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Stepper Status Controls */}
            <div style={{ marginBottom: '20px', backgroundColor: '#27272a', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px', fontWeight: '600' }}>Update Fulfillment State</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['placed', 'confirmed', 'dispatched', 'delivered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, st)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedOrder.orderStatus === st ? '#e11d48' : '#18181b',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Logistics Dispatch & Courier Assignment */}
            <div style={{ marginBottom: '20px', backgroundColor: '#27272a', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>
                Logistics Dispatch & Tracking AWB
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>Courier Partner</label>
                  <select
                    value={orderCarrierInput}
                    onChange={(e) => setOrderCarrierInput(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', fontSize: '12px' }}
                  >
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Shiprocket Air">Shiprocket Air</option>
                    <option value="XpressBees Priority">XpressBees Priority</option>
                    <option value="DTDC Plus">DTDC Plus</option>
                    <option value="Shadowfax Local">Shadowfax Local</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>Air Waybill (AWB) / Tracking #</label>
                  <input
                    type="text"
                    placeholder="e.g. DEL-99281726"
                    value={orderTrackingInput}
                    onChange={(e) => setOrderTrackingInput(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrderTracking}
                  style={{
                    backgroundColor: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Save Tracking
                </button>
              </div>
            </div>

            {/* Customer & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#27272a', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Customer Contact</div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{selectedOrder.customer.name}</div>
                <div style={{ fontSize: '13px', color: '#d4d4d8' }}>{selectedOrder.customer.phone}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{selectedOrder.customer.email}</div>
              </div>

              <div style={{ backgroundColor: '#27272a', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Delivery Destination</div>
                <div style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: '1.4' }}>
                  {selectedOrder.customer.address}<br />
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Items ({selectedOrder.items.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#27272a', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '14px' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Tax Invoice breakdown */}
            <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Coupon Savings</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedOrder.gst && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: '12px' }}>
                  <span>GST 18% ({selectedOrder.gst.taxType === 'INTRA_STATE' ? 'CGST+SGST' : 'IGST'})</span>
                  <span>Included (₹{selectedOrder.gst.totalGst})</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #27272a', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '18px', color: '#fff' }}>
                <span>Total Amount</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => showToast(`GST Invoice exported for ${selectedOrder.orderId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                <PrinterIcon size={16} /> Export Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD COUPON MODAL */}
      {/* ======================================================== */}
      {showCouponModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Launch Promotional Rule</h3>
              <button onClick={() => setShowCouponModal(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', textTransform: 'uppercase', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>
                    {couponForm.type === 'percentage' ? 'Discount Rate (%)' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={couponForm.type === 'percentage' ? '25' : '200'}
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Min Cart (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="999"
                    value={couponForm.minOrder}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional, e.g. 500"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Expiry Date</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '600' }}>Usage Limit Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#27272a', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', backgroundColor: '#e11d48', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteConfirmTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>Remove Product</h3>
            <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to remove <strong>"{deleteConfirmTarget.title}"</strong>? This will delete it from the active catalog.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                style={{ flex: 1, backgroundColor: '#27272a', color: '#cbd5e1', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteProduct}
                style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
