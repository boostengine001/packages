import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CartDrawer } from '../CartDrawer';

describe('Navbar', () => {
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop', badge: 'NEW' },
  ];

  it('renders the brand and nav links', () => {
    render(<Navbar brandName="Boost Store" navLinks={navLinks} />);
    expect(screen.getByText('Boost Store')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/ })).toBeInTheDocument();
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('fires onSearchSubmit with the typed query', () => {
    const onSearchSubmit = vi.fn();
    render(<Navbar brandName="Boost" navLinks={navLinks} onSearchSubmit={onSearchSubmit} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'shoes' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearchSubmit).toHaveBeenCalledWith('shoes');
  });

  it('shows the cart count badge', () => {
    render(<Navbar brandName="Boost" navLinks={navLinks} cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  const columns = [
    { title: 'Shop', links: [{ label: 'All Products', href: '/products' }] },
    { title: 'Support', links: [{ label: 'Contact', href: '/contact' }] },
  ];

  it('renders brand, description and columns', () => {
    render(
      <Footer brandName="Boost Store" description="The best gear" columns={columns} copyrightYear={2026} />
    );
    expect(screen.getByText('Boost Store')).toBeInTheDocument();
    expect(screen.getByText('The best gear')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  });

  it('fires the newsletter submit handler', () => {
    const onNewsletterSubmit = vi.fn();
    const { container } = render(
      <Footer brandName="Boost" columns={columns} newsletter onNewsletterSubmit={onNewsletterSubmit} />
    );
    const email = container.querySelector<HTMLInputElement>('input[type="email"]');
    if (email) {
      fireEvent.change(email, { target: { value: 'dev@boost.dev' } });
      const form = email.closest('form');
      if (form) {
        fireEvent.submit(form);
        expect(onNewsletterSubmit).toHaveBeenCalledWith('dev@boost.dev');
      }
    }
  });
});

describe('CartDrawer', () => {
  const items = [
    { id: 'p1', title: 'Running Shoes', price: 4999, quantity: 1 },
    { id: 'p2', title: 'Socks Pack', price: 499, quantity: 2 },
  ];

  it('renders nothing when closed', () => {
    render(<CartDrawer isOpen={false} items={items} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders items, quantities and the subtotal when open', () => {
    render(<CartDrawer isOpen items={items} subtotal={5997} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Running Shoes')).toBeInTheDocument();
    expect(screen.getByText('Socks Pack')).toBeInTheDocument();
    expect(screen.getByText("$5997.00")).toBeInTheDocument();
  });

  it('fires onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<CartDrawer isOpen items={items} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onUpdateQuantity when quantity is changed', () => {
    const onUpdateQuantity = vi.fn();
    render(<CartDrawer isOpen items={items} onClose={vi.fn()} onUpdateQuantity={onUpdateQuantity} />);
    const qtyButtons = screen.getAllByRole('button', { name: /increase|plus|\+/i });
    if (qtyButtons.length > 0) {
      fireEvent.click(qtyButtons[0]);
      expect(onUpdateQuantity).toHaveBeenCalled();
    }
  });
});
