import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { KPIWidget } from '../KPIWidget';
import { AreaChart } from '../AreaChart';
import { Sparkline } from '../Sparkline';

interface Row {
  name: string;
  qty: number;
}

const columns = [
  { header: 'Name', key: 'name' },
  { header: 'Qty', key: 'qty' },
];

const data: Row[] = [
  { name: 'Widget', qty: 3 },
  { name: 'Gadget', qty: 7 },
];

describe('DataTable', () => {
  it('renders headers and one row per data item', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('filters rows via the search box', () => {
    render(<DataTable columns={columns} data={data} searchable />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'Gadget' } });
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.queryByText('Widget')).not.toBeInTheDocument();
  });

  it('supports row selection with select-all', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={data} selectable onSelectionChange={onSelectionChange} />
    );
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    fireEvent.click(checkboxes[0]); // header select-all
    expect(onSelectionChange).toHaveBeenCalledWith(data);
  });
});

describe('KPIWidget', () => {
  it('renders title, value, and change context', () => {
    render(<KPIWidget title="Revenue" value="$42,000" change={12.5} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$42,000')).toBeInTheDocument();
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs last month/)).toBeInTheDocument();
  });
});

describe('Charts', () => {
  const chartData = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 30 },
  ];

  it('renders the AreaChart svg with axis labels', () => {
    const { container } = render(<AreaChart data={chartData} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('renders an empty state when there is no data', () => {
    render(<AreaChart data={[]} />);
    expect(screen.getByText('No chart data available')).toBeInTheDocument();
  });

  it('renders the Sparkline svg', () => {
    const { container } = render(<Sparkline data={[1, 3, 2, 5, 4]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
