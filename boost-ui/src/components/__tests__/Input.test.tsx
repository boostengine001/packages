import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('associates the label with the field via id', () => {
    render(<Input label="Email" id="email-input" placeholder="you@example.com" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-input');
  });

  it('accepts typed input and fires onChange', () => {
    const onChange = vi.fn();
    render(<Input label="Email" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dev@boost.dev' } });
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('dev@boost.dev');
  });

  it('shows the error message', () => {
    render(<Input label="Email" error="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Input label="Email" helperText="We never share your email" />);
    expect(screen.getByText('We never share your email')).toBeInTheDocument();
  });

  it('forwards a ref to the native input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
