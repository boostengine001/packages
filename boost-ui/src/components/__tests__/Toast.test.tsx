import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders the message with polite status semantics by default', () => {
    render(<Toast message="Saved successfully" />);
    const toast = screen.getByText('Saved successfully').closest('.boost-toast');
    expect(toast).toHaveAttribute('role', 'status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('uses assertive alert semantics for error variant', () => {
    render(<Toast message="Payment failed" variant="error" />);
    const toast = screen.getByText('Payment failed').closest('.boost-toast');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('supports the type prop as an alias for variant', () => {
    render(<Toast message="Uploading..." type="warning" />);
    expect(screen.getByText('Uploading...').closest('.boost-toast')).toHaveClass(
      'boost-toast-warning'
    );
  });

  it('renders a labelled close button that fires onClose', () => {
    const onClose = vi.fn();
    render(<Toast message="Heads up" onClose={onClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Close notification' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no close button when onClose is not provided', () => {
    render(<Toast message="Heads up" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
