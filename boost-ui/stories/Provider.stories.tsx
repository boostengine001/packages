import * as React from 'react';
import { BoostProvider, UIStylePreset } from '../src/index';
import type { Story } from '@ladle/react';

export const withBoostProvider: Story<{ preset: UIStylePreset }> = ({ preset }) => (
  <BoostProvider defaultStylePreset={preset}>
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#64748b' }}>
        Wrap your app with <code>BoostProvider</code> to theme every component.
      </p>
    </div>
  </BoostProvider>
);
withBoostProvider.args = { preset: 'minimal' };
withBoostProvider.argTypes = {
  preset: {
    control: { type: 'select' },
    options: [
      'minimal',
      'glassmorphism',
      'neumorphism',
      'neo-brutalism',
      'dark-first',
      'gradient-glow',
      'material-you',
    ] as UIStylePreset[],
  },
};
