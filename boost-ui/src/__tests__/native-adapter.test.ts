// @vitest-environment node
/**
 * React Native adapter surface test: the native entry must export its full
 * public API without needing an RN runtime. Rendering RN primitives requires a
 * native renderer, so this validates the module boundary and export shape.
 */
import { describe, it, expect } from 'vitest';
import * as native from '../native/index';

describe('React Native adapter surface', () => {
  it('imports without a browser or RN runtime', () => {
    expect(native).toBeTypeOf('object');
  });

  it('exposes the documented adapter exports', () => {
    const exported = Object.keys(native);
    expect(exported.length).toBeGreaterThan(0);
    // Public API pieces documented in README/llms.txt
    for (const key of ['BoostNativeProvider', 'useDesignTokens']) {
      expect(exported).toContain(key);
      expect((native as Record<string, unknown>)[key]).toBeDefined();
    }
  });

  it('every export is a usable value (component, hook or object)', () => {
    for (const [, value] of Object.entries(native)) {
      expect(['function', 'object']).toContain(typeof value);
    }
  });
});
