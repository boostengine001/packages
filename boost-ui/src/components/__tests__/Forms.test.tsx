import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { DatePicker } from '../DatePicker';
import { MultiSelect } from '../MultiSelect';

describe('LoginForm', () => {
  it('renders email and password fields with the title', () => {
    render(<LoginForm title="Welcome back" />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email or Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits credentials on valid input', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Email or Phone'), {
      target: { value: 'dev@boost.dev' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in|log in/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'dev@boost.dev',
        password: 'secret123',
      })
    );
  });

  it('does not submit with empty fields', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in|log in/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the error banner when errorMessage is provided', () => {
    render(<LoginForm errorMessage="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});

describe('DatePicker', () => {
  it('associates the label and accepts a value change', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Delivery date" onChange={onChange} />);
    const input = screen.getByLabelText('Delivery date', { selector: 'input' });
    fireEvent.change(input, { target: { value: '2026-10-20' } });
    expect(onChange).toHaveBeenCalledWith('2026-10-20');
  });

  it('renders the helper text and error message', () => {
    const { rerender } = render(<DatePicker label="Date" helperText="IST timezone" />);
    expect(screen.getByText('IST timezone')).toBeInTheDocument();
    rerender(<DatePicker label="Date" error="Date is required" />);
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('disables the input when disabled is set', () => {
    render(<DatePicker label="Date" disabled />);
    expect(screen.getByLabelText('Date', { selector: 'input' })).toBeDisabled();
  });
});

describe('MultiSelect', () => {
  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' },
  ];

  it('opens the dropdown and toggles options on click', () => {
    const onChange = vi.fn();
    render(<MultiSelect label="Colors" options={options} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /colors/i }));
    fireEvent.click(screen.getByText('Red'));
    expect(onChange).toHaveBeenCalledWith(['red']);
  });

  it('shows the error message', () => {
    render(<MultiSelect label="Colors" options={options} error="Pick at least one" />);
    expect(screen.getByText('Pick at least one')).toBeInTheDocument();
  });
});
