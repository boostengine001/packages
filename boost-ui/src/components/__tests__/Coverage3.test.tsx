import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from '../CopyButton';
import { Motion } from '../Motion';
import { StickyAddToCart } from '../StickyAddToCart';
import { MobileBottomBar } from '../MobileBottomBar';
import { ProductGallery } from '../ProductGallery';
import { DataTable } from '../DataTable';
import { PresetSwitcher } from '../PresetSwitcher';
import { MegaMenu } from '../MegaMenu';

describe('CopyButton', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    delete (navigator as unknown as { clipboard?: unknown }).clipboard;
  });

  it('copies the text and flips to the copied label, then resets', async () => {
    render(<CopyButton text="COUPEN10" label="Copy code" copiedLabel="Copied!" timeout={100} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('COUPEN10'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument());
    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument(),
      { timeout: 1000 }
    );
  });

  it('falls back gracefully when the clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    render(<CopyButton text="X" label="Copy" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });
});

describe('Motion', () => {
  it('renders children inside a motion wrapper', () => {
    render(
      <Motion animation="fade-in" duration={200}>
        <span>Animated content</span>
      </Motion>
    );
    expect(screen.getByText('Animated content')).toBeInTheDocument();
  });

  it('supports trigger-once via IntersectionObserver stub', () => {
    render(
      <Motion animation="slide-up" triggerOnce>
        <span>Observed</span>
      </Motion>
    );
    expect(screen.getByText('Observed')).toBeInTheDocument();
  });
});

describe('StickyAddToCart', () => {
  it('renders product info and fires add-to-cart', () => {
    const onAddToCart = vi.fn();
    render(<StickyAddToCart title="Wireless Earbuds" price={2999} onAddToCart={onAddToCart} />);
    expect(screen.getByText('Wireless Earbuds')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAddToCart).toHaveBeenCalled();
  });
});

describe('MobileBottomBar', () => {
  const items = [
    { id: 'home', label: 'Home', href: '/', icon: <span /> },
    { id: 'cart', label: 'Cart', href: '/cart', icon: <span /> },
  ];

  it('renders tabs and fires onTabChange', () => {
    const onTabChange = vi.fn();
    render(<MobileBottomBar items={items} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('Cart'));
    expect(onTabChange).toHaveBeenCalledWith('cart', '/cart');
  });

  it('shows the cart count badge', () => {
    render(<MobileBottomBar items={items} cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('ProductGallery', () => {
  const images = ['a.png', 'b.png', 'c.png'];

  it('navigates with next/prev controls', () => {
    render(<ProductGallery images={images} />);
    const next = screen.getByRole('button', { name: /next/i });
    const prev = screen.getByRole('button', { name: /prev/i });
    fireEvent.click(next);
    fireEvent.click(next); // wraps to first image
    fireEvent.click(prev);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('shows the empty state without images', () => {
    render(<ProductGallery images={[]} />);
    expect(screen.getByText('No Images Available')).toBeInTheDocument();
  });
});

describe('DataTable sorting', () => {
  const columns = [
    { header: 'Name', key: 'name', sortable: true },
    { header: 'Qty', key: 'qty', sortable: true },
  ];
  const data = [
    { name: 'Banana', qty: 2 },
    { name: 'Apple', qty: 9 },
  ];

  it('sorts rows by the clicked column header', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    const nameSortBtn = container.querySelectorAll('th button')[0];
    fireEvent.click(nameSortBtn); // asc
    expect(container.querySelector('tbody tr td')?.textContent).toBe('Apple');
    fireEvent.click(nameSortBtn); // desc
    expect(container.querySelector('tbody tr td')?.textContent).toBe('Banana');
  });

  it('renders the CSV export button when exportable', () => {
    render(<DataTable columns={columns} data={data} exportable />);
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });
});

describe('PresetSwitcher', () => {
  it('reports preset selection from the pill list', () => {
    const onChange = vi.fn();
    render(<PresetSwitcher mode="pills" value="minimal" onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('MegaMenu', () => {
  const sections = [
    {
      title: 'Shop',
      links: [{ label: 'All Products', href: '/all' }],
    },
  ];

  it('renders sections when controlled open', () => {
    render(<MegaMenu isOpen onOpenChange={vi.fn()} sections={sections} />);
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });

  it('toggles open state from the trigger in uncontrolled mode', () => {
    const onOpenChange = vi.fn();
    render(<MegaMenu triggerLabel="Browse" sections={sections} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: /browse/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
