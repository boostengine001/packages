'use client';

import React, { useEffect, useState } from 'react';
import { StoreSettings } from '../../../data/db';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Mail,
  Phone,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Store settings saved successfully to MongoDB! 🎉' });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving store settings' });
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(file: File) {
    if (!settings) return;
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setSettings({
          ...settings,
          logo: data.url,
        });
        setMessage({
          type: 'success',
          text: 'Logo uploaded successfully! Click "Save Changes" to apply across the store.',
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload logo' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error uploading logo file' });
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-900">Loading store configuration...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to MongoDB store settings document</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200/80 text-indigo-700 uppercase tracking-widest">
              Store Configuration
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Store & Business Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl">
            Configure your brand identity, GST invoice details, and checkout shipping rules. All changes synchronize across the storefront and PDF generator in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10 flex-shrink-0">
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 0: Brand Logo & Visual Assets */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-6 md:p-7 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Store Logo & Brand Assets
              </h2>
              <p className="text-[11px] text-slate-500">
                Upload your official brand logo for the storefront navbar, mobile drawer, and checkout header.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Live Preview Column */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Logo Live Preview
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Light preview */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center h-28 relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider absolute top-2 left-2">
                    Light Mode
                  </span>
                  {settings.logo ? (
                    <img
                      src={settings.logo}
                      alt="Logo Light Preview"
                      className="max-h-12 max-w-[90%] object-contain"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 text-center px-2">
                      Text Fallback ({settings.storeName || 'Store'})
                    </span>
                  )}
                </div>

                {/* Dark preview */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center h-28 relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider absolute top-2 left-2">
                    Dark Mode
                  </span>
                  {settings.logo ? (
                    <img
                      src={settings.logo}
                      alt="Logo Dark Preview"
                      className="max-h-12 max-w-[90%] object-contain brightness-105"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 text-center px-2">
                      Text Fallback
                    </span>
                  )}
                </div>
              </div>

              {settings.logo && (
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, logo: '' })}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Logo</span>
                </button>
              )}
            </div>

            {/* Upload Controls & URL input */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Upload Logo File
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-xl cursor-pointer transition text-xs font-bold text-indigo-700">
                    {uploadingLogo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading Logo...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Click to Upload Logo (PNG, SVG, JPG, WebP)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Recommended: Transparent PNG or SVG logo (approx. height 60px - 100px, width up to 300px).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Or Paste Logo Direct Image URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.logo || ''}
                    onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                    placeholder="https://your-domain.com/assets/logo.png"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Store Profile & Identity */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-6 md:p-7 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Store Profile & Identity
              </h2>
              <p className="text-[11px] text-slate-500">Public store name, storefront URL, and customer support contacts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Store Brand Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Storefront Domain URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={settings.storeUrl}
                  onChange={(e) => setSettings({ ...settings, storeUrl: e.target.value })}
                  placeholder="https://yourstore.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Customer Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="support@yourbrand.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Customer Support Helpline (WhatsApp/Call)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: GST & Tax Compliance */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-6 md:p-7 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                GSTIN & Indian Tax Compliance
              </h2>
              <p className="text-[11px] text-slate-500">Printed on official tax invoices and used for B2B IGST/CGST/SGST calculations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Company GSTIN Number
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                placeholder="27ABCDE1234F1Z5"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Warehouse / Origin State
              </label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                placeholder="Maharashtra, Delhi, Karnataka..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Shipping & Logistics */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-6 md:p-7 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Logistics & Payment Defaults
              </h2>
              <p className="text-[11px] text-slate-500">Free shipping tier threshold and primary courier integration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Free Express Delivery Threshold (₹)
              </label>
              <div className="relative">
                <span className="text-slate-400 text-xs font-bold absolute left-4 top-3">₹</span>
                <input
                  type="number"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Preferred 3PL Logistics Partner
              </label>
              <input
                type="text"
                value={settings.defaultCourier}
                onChange={(e) => setSettings({ ...settings, defaultCourier: e.target.value })}
                placeholder="Bluedart, Delhivery, Shiprocket..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs"
              />
            </div>
          </div>

          {/* COD Toggle */}
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
              <input
                type="checkbox"
                id="enableCod"
                checked={settings.enableCod}
                onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Cash on Delivery (COD)</div>
                <div className="text-[11px] text-slate-500">Allow shoppers to place orders without immediate online prepayment.</div>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
