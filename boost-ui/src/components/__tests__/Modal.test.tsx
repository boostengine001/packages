import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders title, description and children when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirm" description="Are you sure?">
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>Body</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes WAI-ARIA dialog semantics', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirm" description="Details here">
        Body
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'boost-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'boost-modal-desc');
    expect(screen.getByText('Confirm')).toHaveAttribute('id', 'boost-modal-title');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Confirm">
        Body
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click but not on card click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Confirm">
        <button>Inner action</button>
      </Modal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Inner action' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('respects closeOnOverlayClick={false}', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} closeOnOverlayClick={false}>
        Body
      </Modal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('close button is labelled and calls onClose', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Confirm">
        Body
      </Modal>
    );
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()}>
        Body
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('moves focus into the dialog on open (focus trap)', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirm">
        <button>Inner action</button>
      </Modal>
    );
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    await waitFor(() => expect(closeBtn).toHaveFocus());
  });

  it('wraps Tab focus from last to first focusable element', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirm">
        <button>First</button>
        <button>Last</button>
      </Modal>
    );
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    const last = screen.getByRole('button', { name: 'Last' });
    await waitFor(() => expect(closeBtn).toHaveFocus());

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    // Close button (header) is the first focusable element in DOM order
    expect(document.activeElement).toBe(closeBtn);
  });

  it('hides the close button when showCloseButton={false}', () => {
    render(
      <Modal isOpen onClose={vi.fn()} showCloseButton={false}>
        Body
      </Modal>
    );
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });
});
