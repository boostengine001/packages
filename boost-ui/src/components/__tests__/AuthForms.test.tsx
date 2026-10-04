import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';
import { ResetPassword } from '../ResetPassword';
import { ForgotPassword } from '../ForgotPassword';
import { AddressForm } from '../AddressForm';

describe('RegisterForm', () => {
  it('renders the core fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits the filled values', () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Aarav Sharma' } });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'aarav@boost.dev' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByRole('checkbox'));
    const submit = screen.getByRole('button', { name: /create account|sign up|register/i });
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Aarav Sharma', email: 'aarav@boost.dev' })
    );
  });

  it('shows the error banner', () => {
    render(<RegisterForm errorMessage="Email already registered" />);
    expect(screen.getByText('Email already registered')).toBeInTheDocument();
  });
});

describe('ResetPassword', () => {
  it('submits matching passwords', () => {
    const onSubmit = vi.fn();
    render(<ResetPassword onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewSecret1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'NewSecret1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reset|update/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('rejects mismatched passwords', () => {
    const onSubmit = vi.fn();
    render(<ResetPassword onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewSecret1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Different!' } });
    fireEvent.click(screen.getByRole('button', { name: /reset|update/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ForgotPassword', () => {
  it('submits the email address', () => {
    const onSubmit = vi.fn();
    render(<ForgotPassword onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'dev@boost.dev' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send|reset/i }));
    expect(onSubmit).toHaveBeenCalledWith('dev@boost.dev');
  });
});

describe('AddressForm', () => {
  it('fills and submits an address', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'Priya Verma' } });
    fireEvent.change(screen.getByLabelText('Phone Number *'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText('Postal / ZIP Code *'), { target: { value: '110001' } });
    fireEvent.change(screen.getByLabelText('Apt / Suite / House No. *'), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByLabelText('Street Address *'), { target: { value: 'MG Road' } });
    fireEvent.change(screen.getByLabelText('City / Town *'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('State / Province / Region *'), {
      target: { value: 'Delhi' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save|submit|continue/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Priya Verma' }))
    );
  });
});
