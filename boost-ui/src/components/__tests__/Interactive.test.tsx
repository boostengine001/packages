import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover } from '../Popover';
import { FileUpload } from '../FileUpload';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';
import { ProductCard } from '../ProductCard';

describe('Popover', () => {
  it('opens on trigger click and shows the content', () => {
    render(<Popover trigger="Filters" content={<span>Filter options here</span>} />);
    fireEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('Filter options here')).toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger="Open" content={<span>Body</span>} isOpen onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

describe('FileUpload', () => {
  it('opens the file dialog when the dropzone is clicked', () => {
    const onFilesSelected = vi.fn();
    const { container } = render(<FileUpload label="Resume" onFilesSelected={onFilesSelected} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('emits selected files through the change handler', () => {
    const onFilesSelected = vi.fn();
    const { container } = render(<FileUpload label="Resume" onFilesSelected={onFilesSelected} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['hello'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
});

describe('FrequentlyBoughtTogether', () => {
  const mainProduct = {
    id: 'main',
    title: 'Camera Body',
    price: 49999,
    imageUrl: '',
  };
  const suggestedItems = [
    { id: 's1', title: '50mm Lens', price: 15999, imageUrl: '' },
    { id: 's2', title: 'Tripod', price: 2999, imageUrl: '' },
  ];

  it('renders the main product and suggestions', () => {
    render(
      <FrequentlyBoughtTogether mainProduct={mainProduct} suggestedItems={suggestedItems} />
    );
    expect(screen.getAllByText('Camera Body').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50mm Lens').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tripod').length).toBeGreaterThan(0);
  });
});

describe('ProductCard', () => {
  it('renders title, price and rating', () => {
    render(
      <ProductCard id="p1" title="Wireless Earbuds" price={2999} rating={4.5} reviewCount={214} />
    );
    expect(screen.getByText('Wireless Earbuds')).toBeInTheDocument();
    expect(screen.getByText('$2999')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('fires onAddToCart with the product id', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard id="p1" title="Earbuds" price={2999} onAddToCart={onAddToCart} />);
    const cartBtn = screen.getByRole('button', { name: /add to bag/i });
    fireEvent.click(cartBtn);
    expect(onAddToCart).toHaveBeenCalledWith('p1');
  });
});
