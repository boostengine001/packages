'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreProduct } from '../../../data/products';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Package,
  Layers,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleDelete(id: string, title: string) {
    setDeleteTarget({ id, title });
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && (p as any)._id !== id));
        setToast({ message: `"${title}" has been deleted.`, type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to delete product', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error deleting product', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  }

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'General').filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
    const titleStr = (p.title || (p as any).name || '').toLowerCase();
    const skuStr = (p.sku || (p.variants?.[0]?.sku) || '').toLowerCase();
    const brandStr = (p.brand || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch =
      search === '' ||
      titleStr.includes(q) ||
      skuStr.includes(q) ||
      brandStr.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Product Inventory & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage SKUs, dynamic pricing tiers, HSN tax classifications, and product variants.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 sm:p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading live products from MongoDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-600">No products matched your search or filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="py-3.5 px-5">Product Info</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Price</th>
                    <th className="py-3.5 px-5">SKU & HSN</th>
                    <th className="py-3.5 px-5">Variants</th>
                    <th className="py-3.5 px-5">Stock Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((product, idx) => (
                    <tr key={product.id || (product as any)._id || (product as any).slug || product.sku || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0 border border-slate-200">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-slate-900 truncate text-xs">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-indigo-600 font-semibold">
                            {product.brand}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-600 font-semibold">
                        {product.category}
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-slate-900 font-black text-xs block">
                          ₹{product.price?.toLocaleString('en-IN') || 0}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price ? (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{product.compareAtPrice?.toLocaleString('en-IN') || 0}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                        <div className="font-bold text-slate-800">{product.sku}</div>
                        <div className="text-[10px] text-slate-400">HSN: {product.hsnCode}</div>
                      </td>

                      <td className="py-4 px-5 text-slate-500">
                        {product.variants && product.variants.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/80">
                            <Layers className="w-3 h-3" />
                            {product.variants.length} options
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Single SKU</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                            product.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.inStock ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right space-x-1.5">
                        <Link
                          href={`/products/${(product as any).slug || product.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex transition"
                          title="Preview on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 inline-flex transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((product, idx) => (
                <div key={product.id || (product as any)._id || (product as any).slug || product.sku || idx} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0 border border-slate-200">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">
                        {product.title}
                      </div>
                      <div className="text-[11px] text-indigo-600 font-semibold">
                        {product.brand} • {product.category}
                      </div>
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-slate-900 font-black text-xs">
                          ₹{product.price?.toLocaleString('en-IN') || 0}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price ? (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{product.compareAtPrice?.toLocaleString('en-IN') || 0}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        product.inStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${(product as any).slug || product.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-700"
                        title="Preview on Storefront"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Product?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-zinc-300">"{deleteTarget.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100'
                : 'bg-rose-900/90 border-rose-700 text-rose-100'
            }`}
          >
            <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
