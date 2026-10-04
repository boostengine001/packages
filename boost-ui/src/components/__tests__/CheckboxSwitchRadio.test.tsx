import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';
import { RadioGroup } from '../Radio';

describe('Checkbox', () => {
  it('toggles via click and label association', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" checked={false} onChange={onChange} />);
    let clickedChecked: boolean | undefined;
    onChange.mockImplementation((e: React.ChangeEvent<HTMLInputElement>) => {
      clickedChecked = e.target.checked;
    });
    const box = screen.getByLabelText('Remember me') as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(clickedChecked).toBe(true);
  });

  it('respects disabled state', () => {
    render(<Checkbox label="Locked" disabled />);
    expect(screen.getByLabelText('Locked')).toBeDisabled();
  });
});

describe('Switch', () => {
  it('exposes switch semantics and toggles on click', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Notifications" />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });
});

describe('RadioGroup', () => {
  const options = [
    { label: 'Standard', value: 'std' },
    { label: 'Express', value: 'exp' },
    { label: 'Pickup', value: 'pick', disabled: true },
  ];

  it('renders radio inputs with group selection', () => {
    const onChange = vi.fn();
    render(<RadioGroup name="delivery" options={options} value="std" onChange={onChange} />);
    const standard = screen.getByLabelText('Standard') as HTMLInputElement;
    const express = screen.getByLabelText('Express') as HTMLInputElement;
    expect(standard.checked).toBe(true);
    expect(express.checked).toBe(false);
    fireEvent.click(express);
    expect(onChange).toHaveBeenCalledWith('exp');
  });

  it('disables individual options', () => {
    render(<RadioGroup name="delivery" options={options} value="std" />);
    expect(screen.getByLabelText('Pickup')).toBeDisabled();
  });
});
