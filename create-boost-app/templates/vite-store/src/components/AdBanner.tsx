import React, { useState, useEffect } from 'react';
import { SparklesIcon, CloseIcon, ArrowRightIcon } from './Icons';
import { useLocation } from 'react-router-dom';

interface AdBannerData {
  text: string;
  backgroundColor: string;
  textColor: string;
  link: string;
  isActive: boolean;
  showCloseButton: boolean;
}

const DEFAULT_BANNER: AdBannerData = {
  text: '⚡ FLASH SALE: Extra 20% OFF on all streetwear collections!',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  link: '#catalog',
  isActive: true,
  showCloseButton: true,
};

export const AdBanner: React.FC = () => {
  const location = useLocation();
  const [ad, setAd] = useState<AdBannerData>(DEFAULT_BANNER);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    fetch(`${apiBase}/ad-banner`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && data.data) {
          setAd(data.data);
        }
      })
      .catch(() => {
        // Fallback to default banner
      });
  }, []);

  // Hide on admin routes or when dismissed
  if (location.pathname.startsWith('/admin') || isDismissed || !ad.isActive) {
    return null;
  }

  return (
    <aside
      aria-label="Promotional announcement"
      style={{
        backgroundColor: ad.backgroundColor || '#4f46e5',
        color: ad.textColor || '#ffffff',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 600,
        position: 'relative',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <SparklesIcon size={14} style={{ color: '#fbbf24' }} />
        <span>{ad.text}</span>
        <span
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            fontWeight: 700,
          }}
        >
          USE: BOOST20
        </span>
        {ad.link && (
          <a
            href={ad.link}
            style={{
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'underline',
              fontSize: '11px',
            }}
          >
            <span>Shop Now</span>
            <ArrowRightIcon size={12} />
          </a>
        )}
      </div>

      {ad.showCloseButton && (
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            right: '12px',
            opacity: 0.8,
          }}
          aria-label="Dismiss banner"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </aside>
  );
};
