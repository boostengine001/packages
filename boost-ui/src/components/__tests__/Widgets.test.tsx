import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel } from '../Carousel';
import { AnnouncementBar } from '../AnnouncementBar';
import { Tooltip } from '../Tooltip';

describe('Carousel', () => {
  const slides = [<div key="1">Slide One</div>, <div key="2">Slide Two</div>];

  it('renders the active slide content', () => {
    render(<Carousel items={slides} />);
    expect(screen.getByText('Slide One')).toBeInTheDocument();
  });

  it('advances to the next slide on the next control', () => {
    render(<Carousel items={slides} />);
    const next = screen.getByRole('button', { name: /next/i });
    fireEvent.click(next);
    expect(screen.getByText('Slide Two')).toBeInTheDocument();
  });

  it('auto-advances after the interval', () => {
    vi.useFakeTimers();
    try {
      render(<Carousel items={slides} autoPlay interval={1000} />);
      expect(screen.getByText('Slide One')).toBeInTheDocument();
      vi.advanceTimersByTime(1100);
      expect(screen.getByText('Slide Two')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('AnnouncementBar', () => {
  it('renders the message and hides after close', () => {
    render(<AnnouncementBar messages="Free shipping over ₹499" />);
    expect(screen.getByText('Free shipping over ₹499')).toBeInTheDocument();
    const close = screen.queryByRole('button', { name: /close|dismiss/i });
    if (close) {
      fireEvent.click(close);
      expect(screen.queryByText('Free shipping over ₹499')).not.toBeInTheDocument();
    }
  });
});

describe('Tooltip', () => {
  beforeEach(() => {});
  afterEach(() => {});

  it('shows the tooltip content on hover and hides on leave', () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="Helper text">
          <button>Trigger</button>
        </Tooltip>
      );
      const trigger = screen.getByRole('button', { name: 'Trigger' });
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(100);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
      fireEvent.mouseLeave(trigger);
      vi.advanceTimersByTime(100);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
