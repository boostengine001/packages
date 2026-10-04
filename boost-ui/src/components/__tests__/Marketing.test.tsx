import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingTable } from '../PricingTable';
import { HeroSection } from '../HeroSection';
import { FAQSection } from '../FAQSection';
import { CTASection } from '../CTASection';

describe('PricingTable', () => {
  const tiers = [
    { id: 'starter', name: 'Starter', priceMonthly: 0, description: 'For hobbyists', features: ['1 project'] },
    { id: 'pro', name: 'Pro', priceMonthly: 29, priceAnnual: 290, description: 'For teams', features: ['Unlimited projects'] },
  ];

  it('renders all tiers with their prices', () => {
    render(<PricingTable tiers={tiers} />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
  });

  it('fires onBillingCycleChange when the toggle is used', () => {
    const onBillingCycleChange = vi.fn();
    render(
      <PricingTable tiers={tiers} showToggle onBillingCycleChange={onBillingCycleChange} />
    );
    const annual = screen.getByRole('button', { name: /annual/i });
    fireEvent.click(annual);
    expect(onBillingCycleChange).toHaveBeenCalledWith('annual');
  });
});

describe('HeroSection', () => {
  it('renders title, description and both actions', () => {
    const primaryAction = vi.fn();
    render(
      <HeroSection
        title="Ship your store in minutes"
        description="Zero-config UI kit for modern commerce."
        primaryAction={{ label: 'Get started', onClick: primaryAction }}
        secondaryAction={{ label: 'Docs', href: '/docs' }}
      />
    );
    expect(screen.getByText('Ship your store in minutes')).toBeInTheDocument();
    expect(screen.getByText('Zero-config UI kit for modern commerce.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(primaryAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Docs' })).toBeInTheDocument();
  });
});

describe('FAQSection', () => {
  const faqs = [
    { question: 'Is it free?', answer: 'Yes, MIT licensed.' },
    { question: 'Does it need Tailwind?', answer: 'No, zero CSS dependencies.' },
  ];

  it('renders all questions and expands answers on click', () => {
    render(<FAQSection items={faqs} />);
    expect(screen.getByText('Is it free?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Is it free?'));
    expect(screen.getByText('Yes, MIT licensed.')).toBeInTheDocument();
  });
});

describe('CTASection', () => {
  it('renders the call-to-action content and fires the action', () => {
    const onAction = vi.fn();
    render(
      <CTASection
        title="Ready to build?"
        description="Start today."
        primaryAction={{ label: 'Start free', onClick: onAction }}
      />
    );
    expect(screen.getByText('Ready to build?')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Start free' });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
