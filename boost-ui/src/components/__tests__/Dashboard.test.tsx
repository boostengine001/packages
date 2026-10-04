import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { NotificationCenter } from '../NotificationCenter';
import { OTPInput } from '../OTPInput';
import { SearchInput } from '../SearchInput';
import { FileDropzone } from '../FileDropzone';
import { VariantSelector } from '../VariantSelector';
import { OrderTimeline } from '../OrderTimeline';
import { BarChart } from '../BarChart';
import { DonutChart } from '../DonutChart';
import { ReviewBreakdownBars } from '../ReviewBreakdownBars';

describe('Sidebar', () => {
  const groups = [
    { title: 'Main', items: [{ id: 'home', label: 'Home' }, { id: 'orders', label: 'Orders' }] },
  ];

  it('renders groups and fires onSelect for nav items', () => {
    const onSelect = vi.fn();
    render(<Sidebar groups={groups} onSelect={onSelect} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Orders'));
    expect(onSelect).toHaveBeenCalledWith('orders');
  });

  it('marks the active item', () => {
    render(<Sidebar groups={groups} activeId="home" />);
    expect(screen.getByText('Home').closest('.sidebar-nav-item')).toHaveClass('active');
  });
});

describe('NotificationCenter', () => {
  const notifications = [
    { id: 'n1', title: 'Order shipped', timestamp: '2m ago', read: false },
    { id: 'n2', title: 'Payment received', timestamp: '1h ago', read: true },
  ];

  it('shows the unread count and list after opening', () => {
    render(<NotificationCenter notifications={notifications} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Order shipped')).toBeInTheDocument();
    expect(screen.getByText('Payment received')).toBeInTheDocument();
  });

  it('fires onItemClick for a notification', () => {
    const onItemClick = vi.fn();
    render(<NotificationCenter notifications={notifications} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Order shipped'));
    expect(onItemClick).toHaveBeenCalledWith(notifications[0]);
  });
});

describe('OTPInput', () => {
  it('renders the requested number of digit cells', () => {
    const { container } = render(<OTPInput length={4} />);
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('fires onChange and onComplete when filled', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<OTPInput length={2} onChange={onChange} onComplete={onComplete} value="" />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('SearchInput', () => {
  it('fires onSearch with the typed query', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'shoes' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('shoes');
  });
});

describe('FileDropzone', () => {
  it('accepts dropped files and reports them', () => {
    const onFilesSelected = vi.fn();
    render(<FileDropzone onFilesSelected={onFilesSelected} />);
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
});

describe('VariantSelector', () => {
  const groups = [
    {
      name: 'Size',
      options: [
        { id: 's', label: 'S' },
        { id: 'm', label: 'M' },
      ],
    },
  ];

  it('fires onChange with group and option value', () => {
    const onChange = vi.fn();
    render(<VariantSelector groups={groups} onChange={onChange} />);
    fireEvent.click(screen.getByText('M'));
    expect(onChange).toHaveBeenCalledWith('Size', 'M', expect.objectContaining({ id: 'm' }));
  });
});

describe('OrderTimeline', () => {
  it('renders all stages with completed/current states', () => {
    render(<OrderTimeline currentStage="shipped" />);
    expect(screen.getByText(/placed/i)).toBeInTheDocument();
    expect(screen.getByText(/shipped/i)).toBeInTheDocument();
    expect(screen.getByText(/delivered/i)).toBeInTheDocument();
  });
});

describe('Charts', () => {
  const data = [
    { label: 'Jan', value: 10 },
    { label: 'Feb', value: 30 },
  ];

  it('renders BarChart svg with labels', () => {
    const { container } = render(<BarChart data={data} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('renders DonutChart legend', () => {
    render(<DonutChart data={data} showLegend />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });
});

describe('ReviewBreakdownBars', () => {
  it('renders per-star rows and fires star filter', () => {
    const onFilterByStar = vi.fn();
    render(
      <ReviewBreakdownBars
        averageRating={4.2}
        totalReviews={100}
        breakdown={{ 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 }}
        onFilterByStar={onFilterByStar}
      />
    );
    const five = screen.getByText('5');
    fireEvent.click(five);
    expect(onFilterByStar).toHaveBeenCalledWith(5);
  });
});
