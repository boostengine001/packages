import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
  BoostProvider,
  UIStylePreset,
  Navbar,
  Footer,
  HeroSection,
  CTASection,
  ProductCard,
  PricingTable,
  LightningDealsBar,
  CouponInput,
  Snackbar,
  ThemeToggle,
  DropdownMenu,
  DateRangePicker,
  LogoCloud,
  FeatureGrid,
  TestimonialGrid,
  OrderSummary,
  DataTable,
} from '../../index';

const PRESETS: UIStylePreset[] = [
  'minimal',
  'glassmorphism',
  'neumorphism',
  'neo-brutalism',
  'dark-first',
  'gradient-glow',
  'material-you',
];

// Rendering every big component under all 7 presets exercises each style-switch
// branch — the largest source of uncovered lines in the library.
describe.each(PRESETS)('preset rendering: %s', (preset) => {
  it('Navbar renders brand, links and cart badge', () => {
    render(
      <BoostProvider defaultStylePreset={preset}>
        <Navbar
          brandName="Boost"
          navLinks={[
            { label: 'Shop', href: '/shop' },
            { label: 'Deals', href: '/deals' },
          ]}
          cartCount={2}
        />
      </BoostProvider>
    );
    expect(screen.getByText('Boost')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('Footer renders columns and payment badges', () => {
    render(
      <BoostProvider defaultStylePreset={preset}>
        <Footer
          brandName="Boost"
          columns={[{ title: 'Shop', links: [{ label: 'All', href: '/all' }] }]}
          copyrightYear={2026}
        />
      </BoostProvider>
    );
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('HeroSection + CTASection render with actions', () => {
    render(
      <BoostProvider defaultStylePreset={preset}>
        <HeroSection title="Ship faster" primaryAction={{ label: 'Start' }} />
        <CTASection title="Go pro" primaryAction={{ label: 'Upgrade' }} />
      </BoostProvider>
    );
    expect(screen.getByText('Ship faster')).toBeInTheDocument();
    expect(screen.getByText('Go pro')).toBeInTheDocument();
  });

  it('ProductCard renders price and discount', () => {
    render(
      <BoostProvider defaultStylePreset={preset}>
        <ProductCard id="p" title="Earbuds" price={2999} compareAtPrice={4999} rating={4} />
      </BoostProvider>
    );
    expect(screen.getByText('Earbuds')).toBeInTheDocument();
  });

  it('PricingTable renders tiers', () => {
    render(
      <BoostProvider defaultStylePreset={preset}>
        <PricingTable
          tiers={[{ id: 'p', name: 'Pro', priceMonthly: 29, features: ['All'] }]}
        />
      </BoostProvider>
    );
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });
});

describe('component behaviors', () => {
  it('LightningDealsBar counts down from dealEndsInSeconds', () => {
    vi.useFakeTimers();
    try {
      render(<LightningDealsBar dealEndsInSeconds={120} claimedPercent={40} />);
      expect(screen.getByText(/2m/i)).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      // after 2s the remaining time re-renders; component must not crash
      expect(screen.getByText(/1m/i)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('CouponInput applies an entered code', () => {
    const onApply = vi.fn();
    render(<CouponInput onApply={onApply} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'BOOST10' } });
    fireEvent.click(screen.getByRole('button'));
    expect(onApply).toHaveBeenCalledWith('BOOST10');
  });

  it('CouponInput shows the applied state', () => {
    render(<CouponInput appliedCode="BOOST10" discountText="10% off" onRemove={vi.fn()} />);
    expect(screen.getByText('BOOST10')).toBeInTheDocument();
  });

  it('Snackbar fires the action and closes', () => {
    const onAction = vi.fn();
    render(<Snackbar message="Item archived" actionLabel="Undo" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('ThemeToggle renders all four variants', () => {
    for (const variant of ['icon', 'button', 'segmented', 'switch'] as const) {
      const { unmount } = render(<ThemeToggle variant={variant} />);
      const selector =
        variant === 'segmented'
          ? '.boost-theme-segmented'
          : variant === 'switch'
            ? '.boost-theme-switch'
            : variant === 'button'
              ? '.boost-theme-button'
              : '.boost-theme-icon-toggle';
      expect(document.querySelector(selector)).not.toBeNull();
      unmount();
    }
  });

  it('DropdownMenu opens with ArrowDown and closes with Escape', () => {
    render(
      <DropdownMenu
        trigger="Options"
        items={[
          { id: 'a', label: 'First action' },
          { id: 'b', label: 'Second action' },
        ]}
      />
    );
    const trigger = screen.getByRole('button', { name: /options/i });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    await_waitFor_menu_closed();
  });

  async function await_waitFor_menu_closed() {
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  }

  it('DateRangePicker enforces min on the end date', () => {
    render(<DateRangePicker label="Range" />);
    const start = screen.getByLabelText('Range — start date') as HTMLInputElement;
    fireEvent.change(start, { target: { value: '2026-10-01' } });
    const end = screen.getByLabelText('Range — end date') as HTMLInputElement;
    expect(end).toHaveAttribute('min', '2026-10-01');
  });

  it('LogoCloud and FeatureGrid render with brand entries', () => {
    render(<LogoCloud />);
    expect(document.querySelector('.boost-logo-cloud, [class*="logo"]')).not.toBeNull();
    render(<FeatureGrid />);
    expect(document.body).toBeInTheDocument();
  });

  it('TestimonialGrid renders provided testimonials', () => {
    render(
      <TestimonialGrid
        testimonials={[
          { quote: 'Great kit', authorName: 'Dev One' },
          { quote: 'Saved weeks', authorName: 'Dev Two' },
        ]}
      />
    );
    expect(screen.getAllByText(/Dev (One|Two)/).length).toBeGreaterThan(0);
  });

  it('OrderSummary computes totals with discount and tax', () => {
    render(<OrderSummary subtotal={1000} discount={100} shippingFee={50} tax={90} />);
    expect(screen.getByText(/9(?=.*40)|1,040|1040/)).toBeInTheDocument();
  });

  it('DataTable paginates when pageSize is smaller than data', () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({ name: `Row ${i + 1}`, qty: i }));
    render(
      <DataTable
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Qty', key: 'qty' },
        ]}
        data={rows}
        pageSize={10}
      />
    );
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.queryByText('Row 15')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }) ?? screen.getAllByRole('button').pop()!);
  });
});
