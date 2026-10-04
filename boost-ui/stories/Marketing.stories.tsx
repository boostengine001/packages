import * as React from 'react';
import { HeroSection, PricingTable, FAQSection, CTASection, TestimonialCard, FeatureGrid, LogoCloud } from '../src/index';

export const Hero = () => (
  <HeroSection
    badge="New: v2.1.5"
    title="Ship your store in minutes"
    description="Zero-config UI kit for modern commerce, SaaS and dashboards."
    primaryAction={{ label: 'Get started' }}
    secondaryAction={{ label: 'Read docs', href: '/docs' }}
  />
);

export const Pricing = () => (
  <PricingTable
    showToggle
    tiers={[
      { id: 's', name: 'Starter', priceMonthly: 0, description: 'For hobbyists', features: ['1 project', 'Community support'] },
      { id: 'p', name: 'Pro', priceMonthly: 29, priceAnnual: 290, description: 'For teams', features: ['Unlimited projects', 'Priority support'], badge: 'Popular', isPopular: true },
      { id: 'e', name: 'Enterprise', priceMonthly: 99, description: 'For scale', features: ['SSO', 'SLA', 'Dedicated support'] },
    ]}
  />
);

export const FAQ = () => (
  <FAQSection
    items={[
      { question: 'Is it free?', answer: 'Yes — MIT licensed, forever.' },
      { question: 'Does it need Tailwind?', answer: 'No. Zero external CSS dependencies.' },
      { question: 'Does it work with Next.js App Router?', answer: 'Yes — every build ships a use client directive.' },
    ]}
  />
);

export const SocialProof = () => (
  <div style={{ display: 'grid', gap: '24px' }}>
    <TestimonialCard quote="Shipped our storefront in a weekend." authorName="Aarav Sharma" verified />
    <FeatureGrid />
    <LogoCloud />
    <CTASection title="Ready to build?" description="Start with 122 production components." primaryAction={{ label: 'Start free' }} />
  </div>
);
