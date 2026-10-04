import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Drawer } from '../Drawer';
import { BottomSheet } from '../BottomSheet';
import { CommandPalette } from '../CommandPalette';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()}>
        Body
      </Drawer>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title, children and footer when open', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} title="Filters" footer={<button>Apply</button>}>
        <p>Filter body</p>
      </Drawer>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Filter body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('closes via the close button', () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen onClose={onClose} title="Filters">
        Body
      </Drawer>
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('BottomSheet', () => {
  it('renders content when open and hides when closed', () => {
    const { rerender } = render(
      <BottomSheet isOpen onClose={vi.fn()} title="Share">
        <p>Share options</p>
      </BottomSheet>
    );
    expect(screen.getByText('Share options')).toBeInTheDocument();
    rerender(
      <BottomSheet isOpen={false} onClose={vi.fn()} title="Share">
        <p>Share options</p>
      </BottomSheet>
    );
    expect(screen.queryByText('Share options')).not.toBeInTheDocument();
  });

  it('closes via the close button', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen onClose={onClose} title="Share">
        Body
      </BottomSheet>
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('CommandPalette', () => {
  const items = [
    { id: 'dash', label: 'Dashboard', group: 'Pages', onSelect: vi.fn(), keywords: [] },
    { id: 'orders', label: 'Orders', group: 'Pages', onSelect: vi.fn(), keywords: [] },
    { id: 'logout', label: 'Log out', group: 'Account', onSelect: vi.fn(), keywords: [] },
  ];

  it('filters commands by the search query', async () => {
    render(<CommandPalette isOpen onClose={vi.fn()} items={items} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ord' } });
    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  it('runs the selected command and closes', async () => {
    const onClose = vi.fn();
    render(<CommandPalette isOpen onClose={onClose} items={items} />);
    fireEvent.click(screen.getByText('Dashboard'));
    await waitFor(() => expect(items[0].onSelect).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});
