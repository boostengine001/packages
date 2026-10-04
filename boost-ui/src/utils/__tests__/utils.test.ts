import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
  generateId,
  clamp,
  groupBy,
  deepMerge,
  omit,
  pick,
  debounce,
  getInitials,
  isValidEmail,
  isValidIndianPincode,
  isValidIndianMobile,
} from '../index';

describe('cn', () => {
  it('joins truthy class names and filters falsy ones', () => {
    expect(cn('a', false, 'b', null, 'c', undefined, 0, 'd')).toBe('a b c d');
  });
  it('returns an empty string for no truthy inputs', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default and drops decimals for whole amounts', () => {
    expect(formatCurrency(1499)).toBe('$1,499');
  });
  it('keeps two decimals for fractional amounts', () => {
    expect(formatCurrency(49.99)).toBe('$49.99');
  });
  it('formats INR with Indian separators', () => {
    expect(formatCurrency(1499, 'INR', 'en-IN')).toBe('₹1,499');
    expect(formatCurrency(1482900, 'INR', 'en-IN')).toBe('₹14,82,900');
  });
});

describe('formatNumber', () => {
  it('uses the Indian numbering system for en-IN', () => {
    expect(formatNumber(1482900, 'en-IN')).toBe('14,82,900');
  });
  it('passes through Intl.NumberFormatOptions', () => {
    expect(formatNumber(0.856, 'en-US', { style: 'percent' })).toBe('86%');
  });
});

describe('formatDate', () => {
  it('formats a date with the default short-month style', () => {
    expect(formatDate(new Date(2026, 8, 18))).toBe('Sep 18, 2026');
  });
  it('returns "Invalid Date" for garbage input instead of throwing', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });
});

describe('formatRelativeTime', () => {
  it('says "just now" for the recent past', () => {
    expect(formatRelativeTime(new Date(Date.now() - 30 * 1000))).toBe('just now');
  });
  it('formats minutes and hours ago', () => {
    expect(formatRelativeTime(new Date(Date.now() - 60 * 1000))).toBe('1 minute ago');
    expect(formatRelativeTime(new Date(Date.now() - 2 * 3600 * 1000))).toBe('2 hours ago');
  });
  it('formats future time with an "in " prefix', () => {
    expect(formatRelativeTime(new Date(Date.now() + 2 * 86400 * 1000))).toBe('in 2 days');
  });
});

describe('truncate', () => {
  it('appends an ellipsis within the max length', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });
  it('returns the string untouched when within bounds', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });
});

describe('slugify', () => {
  it('produces URL-safe slugs', () => {
    expect(slugify('Hello World! 2026')).toBe('hello-world-2026');
    expect(slugify('  Running Shoes — Nike  ')).toBe('running-shoes-nike');
  });
});

describe('generateId', () => {
  it('generates ids of the requested length from lowercase alphanumerics', () => {
    const id = generateId(12);
    expect(id).toMatch(/^[a-z0-9]{12}$/);
  });
  it('defaults to length 8 and produces unique ids', () => {
    expect(generateId()).toHaveLength(8);
    expect(new Set([generateId(), generateId(), generateId()]).size).toBe(3);
  });
});

describe('clamp', () => {
  it('clamps to the boundaries and passes through in-range values', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe('groupBy', () => {
  it('groups items by the given key', () => {
    const rows = [
      { type: 'A', v: 1 },
      { type: 'B', v: 2 },
      { type: 'A', v: 3 },
    ];
    expect(groupBy(rows, 'type')).toEqual({
      A: [
        { type: 'A', v: 1 },
        { type: 'A', v: 3 },
      ],
      B: [{ type: 'B', v: 2 }],
    });
  });
});

describe('deepMerge', () => {
  it('recursively merges nested plain objects', () => {
    expect(
      deepMerge<{ a: number; b: { c?: number; d?: number } }>(
        { a: 1, b: { c: 2 } },
        { b: { d: 3 } }
      )
    ).toEqual({ a: 1, b: { c: 2, d: 3 } });
  });
  it('replaces arrays instead of merging them element-wise', () => {
    expect(deepMerge({ tags: ['a', 'b'] }, { tags: ['c'] })).toEqual({ tags: ['c'] });
  });
  it('keeps target values when the source value is undefined', () => {
    expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
  });
});

describe('omit / pick', () => {
  const obj = { a: 1, b: 2, c: 3 };
  it('omit removes the given keys without mutating the source', () => {
    expect(omit(obj, ['b', 'c'])).toEqual({ a: 1 });
    expect(obj).toEqual({ a: 1, b: 2, c: 3 });
  });
  it('pick keeps only the given keys', () => {
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });
});

describe('debounce', () => {
  it('collapses rapid calls into one trailing invocation with the latest args', () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn();
      const debounced = debounce(fn, 400);
      debounced('first');
      vi.advanceTimersByTime(200);
      debounced('second');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('getInitials', () => {
  it('extracts up to two initials, uppercase', () => {
    expect(getInitials('Aarav Sharma')).toBe('AS');
    expect(getInitials('Priya')).toBe('P');
  });
  it('honours maxChars and handles empty input', () => {
    expect(getInitials('Aarav Kumar Sharma', 3)).toBe('AKS');
    expect(getInitials('')).toBe('');
  });
});

describe('validators', () => {
  it('isValidEmail', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
  });
  it('isValidIndianPincode rejects non 6-digit or zero-start codes', () => {
    expect(isValidIndianPincode('110001')).toBe(true);
    expect(isValidIndianPincode('1234')).toBe(false);
    expect(isValidIndianPincode('011001')).toBe(false);
  });
  it('isValidIndianMobile accepts 6-9 prefixed 10-digit numbers', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('1234567890')).toBe(false);
    expect(isValidIndianMobile('98765432')).toBe(false);
  });
});
