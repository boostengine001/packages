import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../Toast';

function ToastProbe(): React.ReactElement {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Saved!')}>success</button>
      <button onClick={() => toast.error('Boom!')}>error</button>
      <button onClick={() => toast.info('FYI')}>info</button>
      <button onClick={() => toast.warning('Careful')}>warning</button>
      <button onClick={() => toast.loading('Working...')}>loading</button>
      <button
        onClick={() => {
          const id = toast.success('Dismiss me');
          toast.dismiss(id);
        }}
      >
        dismiss-self
      </button>
      <button
        onClick={() => {
          void toast.promise(Promise.resolve('done'), {
            loading: 'Uploading',
            success: 'Uploaded!',
            error: 'Upload failed',
          });
        }}
      >
        promise-ok
      </button>
      <button
        onClick={() => {
          // toast.promise re-throws for the caller to handle
          toast.promise(Promise.reject(new Error('nope')), {
            loading: 'Uploading',
            success: 'Uploaded!',
            error: 'Upload failed',
          }).catch(() => {});
        }}
      >
        promise-fail
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ToastProvider defaultDuration={3000}>
      <ToastProbe />
    </ToastProvider>
  );
}

describe('ToastProvider / useToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders success toasts via the imperative API', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    const toast = screen.getByText('Saved!');
    expect(toast.closest('.boost-toast')).toHaveClass('boost-toast-success');
  });

  it('error toasts are assertive alerts, info toasts are polite status', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'error' }));
    fireEvent.click(screen.getByRole('button', { name: 'info' }));
    expect(screen.getByText('Boom!').closest('.boost-toast')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('FYI').closest('.boost-toast')).toHaveAttribute('role', 'status');
  });

  it('auto-dismisses after the provider duration', () => {
    vi.useFakeTimers();
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('dismiss(id) removes a specific toast immediately', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'dismiss-self' }));
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('toast.promise shows loading then success', async () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'promise-ok' }));
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Uploaded!')).toBeInTheDocument());
    expect(screen.queryByText('Uploading')).not.toBeInTheDocument();
  });

  it('toast.promise shows the error branch on rejection', async () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'promise-fail' }));
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Upload failed')).toBeInTheDocument());
  });

  it('works outside a provider via safe fallbacks (no crash)', () => {
    render(<ToastProbe />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'success' }))).not.toThrow();
  });
});
