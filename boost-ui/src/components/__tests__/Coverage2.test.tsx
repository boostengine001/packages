import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Filter } from '../Filter';
import { Sort } from '../Sort';
import { ExportButton } from '../ExportButton';
import { ErrorBoundary } from '../ErrorBoundary';
import { PresetSwitcher } from '../PresetSwitcher';
import { Header } from '../Header';
import { DualMobileActionBar } from '../DualMobileActionBar';
import { AddToCart } from '../AddToCart';
import { Divider } from '../Divider';
import { Chip } from '../Chip';
import { Accordion } from '../Accordion';
import { Image } from '../Image';
import { MultiSelect } from '../MultiSelect';

describe('Filter', () => {
  const options = [
    { label: 'In stock', value: 'in', count: 12 },
    { label: 'On sale', value: 'sale', count: 4 },
  ];

  it('toggles options and reports the selected values', () => {
    const onChange = vi.fn();
    render(<Filter label="Availability" options={options} selectedValues={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /availability/i }));
    fireEvent.click(screen.getByText('In stock'));
    expect(onChange).toHaveBeenCalledWith(['in']);
  });

  it('unselects an active option', () => {
    const onChange = vi.fn();
    render(
      <Filter label="Availability" options={options} selectedValues={['in']} onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /availability/i }));
    fireEvent.click(screen.getByText('In stock'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('Sort', () => {
  const options = [
    { label: 'Price', value: 'price' },
    { label: 'Newest', value: 'new' },
  ];

  it('cycles direction when the same option is picked', () => {
    const onChange = vi.fn();
    render(<Sort label="Sort" options={options} currentValue="price" currentDirection="asc" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /sort/i }));
    fireEvent.click(screen.getAllByText('Price').pop()!);
    expect(onChange).toHaveBeenCalledWith('price', 'desc');
  });

  it('resets direction when switching option', () => {
    const onChange = vi.fn();
    render(<Sort label="Sort" options={options} currentValue="price" currentDirection="desc" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /sort/i }));
    fireEvent.click(screen.getAllByText('Newest').pop()!);
    expect(onChange).toHaveBeenCalledWith('new', 'asc');
  });
});

describe('ExportButton', () => {
  it('fires onExport with the configured format', () => {
    const onExport = vi.fn();
    render(<ExportButton onExport={onExport} format="csv" label="Export CSV" />);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('disables while loading', () => {
    render(<ExportButton onExport={vi.fn()} loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ErrorBoundary', () => {
  function Boom(): React.ReactElement {
    throw new Error('kaboom');
  }

  it('renders the fallback and reports the error when a child throws', () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <ErrorBoundary fallback={<div>Something broke</div>} onError={onError}>
          <Boom />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something broke')).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<div>Broke</div>}>
        <span>All good</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});

describe('PresetSwitcher', () => {
  it('renders pills and reports preset changes', () => {
    const onChange = vi.fn();
    render(<PresetSwitcher mode="pills" value="minimal" onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Header', () => {
  it('renders brand, links and fires onLinkClick', () => {
    const onLinkClick = vi.fn();
    render(
      <Header
        brandName="Boost"
        navLinks={[
          { label: 'Shop', href: '/shop' },
          { label: 'Deals', href: '/deals', badge: 'HOT' },
        ]}
        onLinkClick={onLinkClick}
      />
    );
    expect(screen.getByText('Boost')).toBeInTheDocument();
    expect(screen.getByText('HOT')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Shop'));
    expect(onLinkClick).toHaveBeenCalledWith('/shop');
  });
});

describe('DualMobileActionBar', () => {
  it('fires add-to-cart and buy-now actions', () => {
    const onAddToCart = vi.fn();
    const onBuyNow = vi.fn();
    render(<DualMobileActionBar price={2999} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />);
    fireEvent.click(screen.getByRole('button', { name: /cart|add/i }));
    expect(onAddToCart).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /buy/i }));
    expect(onBuyNow).toHaveBeenCalled();
  });
});

describe('AddToCart', () => {
  it('fires onAdd with the chosen quantity', () => {
    const onAdd = vi.fn();
    render(<AddToCart onAdd={onAdd} label="Add to Bag" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add to Bag' }));
    expect(onAdd).toHaveBeenCalledWith(1);
  });
});

describe('Divider', () => {
  it('renders as a horizontal rule without a label', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('renders the label variant', () => {
    render(<Divider label="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('renders label and fires delete via keyboard', () => {
    const onDelete = vi.fn();
    render(<Chip label="Filter: Shoes" onDelete={onDelete} />);
    const del = screen.getByRole('button', { name: 'Delete chip' });
    fireEvent.keyDown(del, { key: 'Enter' });
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders children content', () => {
    render(<Chip>Custom content</Chip>);
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});

describe('Accordion keyboard navigation', () => {
  const items = [
    { id: 'a', title: 'First', content: 'A' },
    { id: 'b', title: 'Second', content: 'B' },
  ];

  it('moves focus with arrow keys between headers', () => {
    render(<Accordion items={items} />);
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first);
  });

  it('jumps with Home and End', () => {
    render(<Accordion items={items} />);
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'Home' });
    expect(document.activeElement).toBe(first);
  });
});

describe('MultiSelect keyboard navigation', () => {
  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
  ];

  it('opens with ArrowDown and selects the highlighted option with Enter', () => {
    const onChange = vi.fn();
    render(<MultiSelect label="Colors" options={options} value={[]} onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: /colors/i });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const red = screen.getByRole('option', { name: 'Red' });
    fireEvent.keyDown(red, { key: 'ArrowDown' });
    const green = screen.getByRole('option', { name: 'Green' });
    expect(document.activeElement).toBe(green);
    fireEvent.keyDown(green, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['green']);
  });
});

describe('Image', () => {
  it('renders the image with the given source and alt', () => {
    render(<Image src="https://example.com/a.png" alt="Product" aspectRatio="square" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('alt', 'Product');
  });

  it('falls back when the image fails to load', () => {
    render(<Image src="https://example.com/broken.png" alt="Broken" fallbackSrc="/fallback.png" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/fallback.png');
  });
});
