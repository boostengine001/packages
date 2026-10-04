import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../Textarea';
import { Select } from '../Select';

describe('Textarea', () => {
  it('associates the label and accepts typed input', () => {
    render(<Textarea label="Message" id="msg" />);
    const area = screen.getByLabelText('Message');
    fireEvent.change(area, { target: { value: 'Hello boost' } });
    expect(area).toHaveValue('Hello boost');
  });

  it('shows the character count when showCount is enabled', () => {
    render(<Textarea label="Message" showCount maxChars={100} value="abcd" onChange={() => {}} />);
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('shows the error message', () => {
    render(<Textarea label="Message" error="Message is required" />);
    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });
});

describe('Select', () => {
  const options = [
    { label: 'Small', value: 's' },
    { label: 'Medium', value: 'm' },
    { label: 'Large', value: 'l', disabled: true },
  ];

  it('renders all options and associates the label', () => {
    render(<Select label="Size" options={options} id="size" />);
    const select = screen.getByLabelText('Size') as HTMLSelectElement;
    expect(select.options).toHaveLength(3);
    expect(select.options[2]).toBeDisabled();
  });

  it('fires onChange with the selected value', () => {
    const onChange = vi.fn();
    render(<Select label="Size" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'm' } });
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('m');
  });

  it('shows the error message', () => {
    render(<Select label="Size" options={options} error="Pick a size" />);
    expect(screen.getByText('Pick a size')).toBeInTheDocument();
  });
});
