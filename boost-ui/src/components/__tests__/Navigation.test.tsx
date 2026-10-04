import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb } from '../Breadcrumb';
import { Pagination } from '../Pagination';
import { Stepper } from '../Stepper';
import { DropdownMenu } from '../DropdownMenu';

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Electronics', href: '/electronics' },
    { label: 'Headphones' },
  ];

  it('renders a labelled nav with links and marks the last item as current', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    const current = screen.getByText('Headphones').closest('[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('fires onItemClick with the item data', () => {
    const onItemClick = vi.fn();
    render(<Breadcrumb items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole('link', { name: 'Electronics' }));
    expect(onItemClick).toHaveBeenCalledWith('/electronics', items[1]);
  });
});

describe('Pagination', () => {
  it('marks the current page and navigates via next/prev', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('disables previous on first page and next on last page', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    rerender(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});

describe('Stepper', () => {
  const steps = [
    { id: 'cart', label: 'Cart' },
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' },
  ];

  it('renders all steps with the active one highlighted', () => {
    render(<Stepper steps={steps} activeStep={1} />);
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('fires onStepClick for completed steps', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} activeStep={2} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByText('Cart'));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});

describe('DropdownMenu', () => {
  const items = [
    { id: 'edit', label: 'Edit', onClick: vi.fn() },
    { id: 'delete', label: 'Delete', onClick: vi.fn(), destructive: true },
  ];

  it('opens on trigger click and runs the selected item handler', () => {
    render(<DropdownMenu trigger="Actions" items={items} />);
    fireEvent.click(screen.getByText('Actions'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    expect(items[1].onClick).toHaveBeenCalledTimes(1);
  });
});
