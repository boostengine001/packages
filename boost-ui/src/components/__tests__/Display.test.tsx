import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../Alert';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { Skeleton } from '../Skeleton';
import { Spinner } from '../Spinner';
import { ProgressBar } from '../ProgressBar';
import { EmptyState } from '../EmptyState';

describe('Alert', () => {
  it('renders title and body with alert semantics', () => {
    render(<Alert title="Payment failed" variant="error">Please retry.</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    expect(screen.getByText('Please retry.')).toBeInTheDocument();
  });

  it('shows a close button when onClose is provided', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Heads up</Alert>);
    const close = screen.getByRole('button');
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Badge', () => {
  it('renders children with variant class', () => {
    render(<Badge variant="success">In stock</Badge>);
    expect(screen.getByText('In stock')).toHaveClass('boost-badge-success');
  });
});

describe('Avatar', () => {
  it('renders initials from the name when no image is provided', () => {
    render(<Avatar name="Aarav Sharma" />);
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('renders the image when src is given', () => {
    render(<Avatar src="https://example.com/a.png" name="Aarav" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/a.png');
  });
});

describe('Skeleton / Spinner', () => {
  it('renders a skeleton block', () => {
    const { container } = render(<Skeleton variant="rectangular" width={200} height={80} />);
    expect(container.querySelector('.boost-skeleton')).not.toBeNull();
  });

  it('renders an svg spinner at the requested pixel size', () => {
    render(<Spinner size={40} data-testid="spinner" />);
    const svg = screen.getByTestId('spinner');
    expect(svg.tagName).toBe('svg');
    expect(svg).toHaveAttribute('width', '40');
  });
});

describe('ProgressBar', () => {
  it('exposes progressbar semantics and the rounded value', () => {
    render(<ProgressBar value={66.6} label="Uploading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '67');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('shows the percentage when requested', () => {
    render(<ProgressBar value={42} showPercent />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description and fires the action', () => {
    const onAction = vi.fn();
    render(
      <EmptyState title="No orders yet" description="Start shopping" actionLabel="Shop now" onAction={onAction} />
    );
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
    expect(screen.getByText('Start shopping')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Shop now' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
