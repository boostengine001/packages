// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, Navbar, Alert, Tabs } from '../../index';

describe('RTL (right-to-left) rendering', () => {
  it('renders navigation components under dir=rtl without crashing and keeps semantics', () => {
    render(
      <div dir="rtl">
        <Navbar brandName="متجر" navLinks={[{ label: 'الرئيسية', href: '/' }]} />
        <Breadcrumb items={[{ label: 'الرئيسية', href: '/' }, { label: 'الحالي' }]} />
        <Alert title="تنبيه">هذا نص تجريبي</Alert>
      </div>
    );
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('الحالي')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('keeps tab semantics under RTL with keyboard navigation intact', () => {
    render(
      <div dir="rtl">
        <Tabs
          items={[
            { id: 'a', label: 'أولاً', content: 'A' },
            { id: 'b', label: 'ثانياً', content: 'B' },
          ]}
        />
      </div>
    );
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getByRole('tab', { name: 'أولاً' })).toHaveAttribute('aria-selected', 'true');
  });
});
