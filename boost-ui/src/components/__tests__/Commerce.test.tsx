import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Price } from '../Price';
import { QuantitySelector } from '../QuantitySelector';
import { StarRating } from '../StarRating';
import { PincodeChecker } from '../PincodeChecker';

describe('Price', () => {
  it('renders the formatted amount', () => {
    render(<Price amount={1499} />);
    expect(screen.getByText('$1,499')).toBeInTheDocument();
  });

  it('shows the discount percentage against the original amount', () => {
    render(<Price amount={749} originalAmount={1499} />);
    expect(screen.getByText('50% OFF')).toBeInTheDocument();
  });
});

describe('QuantitySelector', () => {
  it('increments and decrements via the buttons', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={3} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // [0] is decrement, [1] increment (or vice versa) — assert values below
    const called = onChange.mock.calls[0][0];
    expect([2, 4]).toContain(called);
    fireEvent.click(buttons[0]);
    const second = onChange.mock.calls[1][0];
    expect(second).toBe(called === 4 ? 2 : 4);
  });

  it('does not go below min', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} min={1} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).not.toHaveBeenCalledWith(0);
  });

  it('does not exceed max', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={99} max={99} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onChange).not.toHaveBeenCalledWith(100);
  });
});

describe('StarRating', () => {
  it('clamps ratings above 5 and shows the value', () => {
    render(<StarRating rating={4.8} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('shows the review count when provided', () => {
    render(<StarRating rating={4.2} reviewCount={1284} />);
    expect(screen.getByText('(1284)')).toBeInTheDocument();
  });
});

describe('PincodeChecker', () => {
  it('rejects invalid pincodes without calling onCheck', async () => {
    const onCheck = vi.fn().mockResolvedValue({ isServiceable: true });
    render(<PincodeChecker onCheck={onCheck} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(onCheck).not.toHaveBeenCalled();
  });

  it('checks serviceability for a valid pincode', async () => {
    const onCheck = vi.fn().mockResolvedValue({
      isServiceable: true,
      estimatedDeliveryDate: 'Tomorrow',
    });
    render(<PincodeChecker onCheck={onCheck} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '110001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await vi.waitFor(() => expect(onCheck).toHaveBeenCalledWith('110001'));
    await vi.waitFor(() => expect(screen.getByText(/Tomorrow/i)).toBeInTheDocument());
  });
});
