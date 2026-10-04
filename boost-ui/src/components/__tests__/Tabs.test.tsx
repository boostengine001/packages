import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../Tabs';

const items = [
  { id: 'a', label: 'Tab A', content: 'Content A' },
  { id: 'b', label: 'Tab B', content: 'Content B' },
  { id: 'c', label: 'Tab C', content: 'Content C', disabled: true },
];

describe('Tabs (array API)', () => {
  it('activates the first tab by default with proper ARIA wiring', () => {
    render(<Tabs items={items} />);
    const a = screen.getByRole('tab', { name: 'Tab A' });
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Content A');
  });

  it('renders the tablist with roving tabindex', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('tabindex', '-1');
  });

  it('switches tabs on click and shows the matching panel', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Content B');
  });

  it('moves to the next enabled tab on ArrowRight', () => {
    render(<Tabs items={items} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs when wrapping on ArrowRight', () => {
    render(<Tabs items={items} defaultTab="b" />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    // 'c' is disabled — focus wraps back to 'a'
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps to the last enabled tab on End', () => {
    render(<Tabs items={items} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports controlled usage and fires onValueChange', () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} value="a" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    // Controlled value wins — selection stays on 'a'
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs (compound API)', () => {
  it('renders Tabs.List / Tabs.Trigger / Tabs.Content with context wiring', () => {
    render(
      <Tabs defaultValue="x">
        <Tabs.List>
          <Tabs.Trigger value="x">X Trigger</Tabs.Trigger>
          <Tabs.Trigger value="y">Y Trigger</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="x">X Panel</Tabs.Content>
        <Tabs.Content value="y">Y Panel</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: 'X Trigger' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('X Panel')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Y Trigger' }));
    expect(screen.getByRole('tab', { name: 'Y Trigger' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Y Panel')).toBeInTheDocument();
  });
});
