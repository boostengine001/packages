import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BoostProvider, useTheme } from '../BoostProvider';
import { ThemeToggle } from '../ThemeToggle';
import { Portal } from '../Portal';

describe('BoostProvider / useTheme', () => {
  function Probe() {
    const theme = useTheme();
    return (
      <div>
        <span data-testid="mode">{theme.mode}</span>
        <span data-testid="preset">{theme.stylePreset}</span>
        <span data-testid="currency">{theme.currency}</span>
      </div>
    );
  }

  it('works without a provider via safe fallbacks', () => {
    render(<Probe />);
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('preset')).toHaveTextContent('minimal');
  });

  it('provides theme context through BoostProvider', () => {
    render(
      <BoostProvider defaultMode="dark" defaultStylePreset="glassmorphism">
        <Probe />
      </BoostProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('preset')).toHaveTextContent('glassmorphism');
  });

  it('setStylePreset updates the preset for consumers', () => {
    function SetterProbe() {
      const { setStylePreset, stylePreset } = useTheme();
      return (
        <button onClick={() => setStylePreset('neo-brutalism')} type="button">
          {stylePreset}
        </button>
      );
    }
    render(
      <BoostProvider>
        <SetterProbe />
      </BoostProvider>
    );
    expect(screen.getByRole('button')).toHaveTextContent('minimal');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('neo-brutalism');
  });
});

describe('ThemeToggle', () => {
  it('toggles the theme mode when clicked', () => {
    function ModeProbe() {
      return <span data-testid="mode">{useTheme().mode}</span>;
    }
    render(
      <BoostProvider>
        <ThemeToggle />
        <ModeProbe />
      </BoostProvider>
    );
    const mode = screen.getByTestId('mode');
    const before = mode.textContent;
    fireEvent.click(screen.getByRole('button'));
    expect(mode.textContent).not.toBe(before);
  });
});

describe('Portal', () => {
  it('renders children into document.body, outside the React root', () => {
    const { container } = render(
      <Portal>
        <div data-testid="portal-child">Teleported</div>
      </Portal>
    );
    const child = screen.getByTestId('portal-child');
    expect(container.contains(child)).toBe(false);
    expect(document.body.contains(child)).toBe(true);
    act(() => {
      // ensure effect-driven mount is stable before cleanup
    });
  });
});
