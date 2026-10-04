import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act, screen, fireEvent } from '@testing-library/react';
import {
  useLocalStorage,
  useToggle,
  useDebounce,
  usePrevious,
  useMediaQuery,
  useClickOutside,
  useCopyToClipboard,
  useAnnounce,
  useIsomorphicLayoutEffect,
} from '../index';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns the initial value when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('boost:test:key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('persists JSON-serializable values to localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ count: number }>('boost:test:obj', { count: 0 })
    );
    act(() => result.current[1]({ count: 5 }));
    expect(result.current[0]).toEqual({ count: 5 });
    expect(JSON.parse(window.localStorage.getItem('boost:test:obj')!)).toEqual({ count: 5 });
  });

  it('supports functional updates against the previous value', () => {
    const { result } = renderHook(() => useLocalStorage('boost:test:n', 10));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(11);
  });

  it('removeValue resets state and clears storage', () => {
    const { result } = renderHook(() => useLocalStorage('boost:test:rm', 'init'));
    act(() => result.current[1]('changed'));
    act(() => result.current[2]());
    expect(result.current[0]).toBe('init');
    expect(window.localStorage.getItem('boost:test:rm')).toBeNull();
  });

  it('hydrates from an existing stored value', () => {
    window.localStorage.setItem('boost:test:pre', JSON.stringify([1, 2, 3]));
    const { result } = renderHook(() => useLocalStorage<number[]>('boost:test:pre', []));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });
});

describe('useToggle', () => {
  it('toggles the boolean and supports direct setter', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](false));
    expect(result.current[0]).toBe(false);
  });
});

describe('useDebounce', () => {
  it('delays updating the value until the delay elapses', () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'first' },
      });
      rerender({ value: 'second' });
      expect(result.current).toBe('first');
      act(() => vi.advanceTimersByTime(300));
      expect(result.current).toBe('second');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('usePrevious', () => {
  it('returns the value from the previous render', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 1 } });
    expect(result.current).toBeUndefined();
    rerender({ v: 2 });
    expect(result.current).toBe(1);
    rerender({ v: 3 });
    expect(result.current).toBe(2);
  });
});

describe('useMediaQuery', () => {
  it('reflects matchMedia state changes', () => {
    const listeners: Array<(e: { matches: boolean }) => void> = [];
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('768'),
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(true);
      const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 9999px)'));
      expect(result2.current).toBe(false);

      act(() => listeners.forEach((cb) => cb({ matches: false })));
      expect(result.current).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('useClickOutside', () => {
  it('fires the handler for outside clicks only', () => {
    const handler = vi.fn();
    function Test() {
      const ref = useClickOutside<HTMLDivElement>(handler);
      return (
        <div ref={ref}>
          <button>inside</button>
        </div>
      );
    }
    render(<Test />);
    // Inside click
    fireEvent.mouseDown(screen.getByRole('button', { name: 'inside' }));
    expect(handler).not.toHaveBeenCalled();
    // Outside click
    fireEvent.mouseDown(document.body);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('useCopyToClipboard', () => {
  it('returns false gracefully when the clipboard API is unavailable', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    let copied = false;
    await act(async () => {
      copied = await result.current.copy('text');
    });
    expect(copied).toBe(false);
    expect(result.current.copied).toBe(false);
  });
});

describe('useAnnounce', () => {
  it('writes messages into a polite aria-live region', async () => {
    const { result } = renderHook(() => useAnnounce());
    await act(async () => {
      result.current('Cart updated');
      await Promise.resolve();
    });
    const region = document.getElementById('boost-a11y-live-polite');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveTextContent('Cart updated');
  });

  it('creates an assertive region for urgent messages', async () => {
    const { result } = renderHook(() => useAnnounce());
    await act(async () => {
      result.current('Payment failed', 'assertive');
      await new Promise((r) => setTimeout(r, 10));
    });
    const region = document.getElementById('boost-a11y-live-assertive');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('role', 'alert');
    expect(region).toHaveTextContent('Payment failed');
  });
});

describe('useIsomorphicLayoutEffect', () => {
  it('maps to useLayoutEffect in a browser-like environment', () => {
    expect(useIsomorphicLayoutEffect).toBe(React.useLayoutEffect);
  });
});
