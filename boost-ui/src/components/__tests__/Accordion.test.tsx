import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from '../Accordion';

const items = [
  { id: 'one', title: 'Section One', content: 'Answer One' },
  { id: 'two', title: 'Section Two', content: 'Answer Two' },
  { id: 'gone', title: 'Section Locked', content: 'Answer Locked', disabled: true },
];

describe('Accordion', () => {
  it('renders all item headers collapsed by default', () => {
    render(<Accordion items={items} />);
    const headers = screen.getAllByRole('button');
    expect(headers).toHaveLength(3);
    headers.forEach((h) => expect(h).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.queryByText('Answer One')).not.toBeInTheDocument();
  });

  it('expands an item on click and shows its content', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Section One' }));
    expect(screen.getByRole('button', { name: 'Section One' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByText('Answer One')).toBeInTheDocument();
  });

  it('collapses the open item when another is clicked (single mode)', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Section One' }));
    fireEvent.click(screen.getByRole('button', { name: 'Section Two' }));
    expect(screen.getByRole('button', { name: 'Section One' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Section Two' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('keeps multiple items open with allowMultiple', () => {
    render(<Accordion items={items} allowMultiple />);
    fireEvent.click(screen.getByRole('button', { name: 'Section One' }));
    fireEvent.click(screen.getByRole('button', { name: 'Section Two' }));
    expect(screen.getByText('Answer One')).toBeInTheDocument();
    expect(screen.getByText('Answer Two')).toBeInTheDocument();
  });

  it('honours defaultExpanded', () => {
    render(<Accordion items={items} defaultExpanded={['two']} />);
    expect(screen.getByText('Answer Two')).toBeInTheDocument();
  });

  it('does not open disabled items', () => {
    render(<Accordion items={items} />);
    const locked = screen.getByRole('button', { name: 'Section Locked' });
    expect(locked).toBeDisabled();
    fireEvent.click(locked);
    expect(locked).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Answer Locked')).not.toBeInTheDocument();
  });

  it('toggles an open item closed on second click', () => {
    render(<Accordion items={items} />);
    const header = screen.getByRole('button', { name: 'Section One' });
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Answer One')).not.toBeInTheDocument();
  });
});
