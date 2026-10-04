import * as React from 'react';
import {
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  FormField,
  OTPInput,
  SearchInput,
  MultiSelect,
} from '../src/index';

export const TextFields = () => (
  <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
    <Input label="Email" placeholder="you@example.com" />
    <Input label="Phone" error="Enter a valid number" />
    <Input label="Name" helperText="As printed on your ID" />
    <Textarea label="Message" placeholder="Tell us more..." showCount maxChars={200} />
  </div>
);

export const Selections = () => {
  const [size, setSize] = React.useState('m');
  const [colors, setColors] = React.useState<string[]>(['red']);
  return (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
      <Select
        label="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        options={[
          { label: 'Small', value: 's' },
          { label: 'Medium', value: 'm' },
          { label: 'Large', value: 'l' },
        ]}
      />
      <MultiSelect
        label="Colors"
        value={colors}
        onChange={setColors}
        options={[
          { label: 'Red', value: 'red' },
          { label: 'Green', value: 'green' },
          { label: 'Blue', value: 'blue' },
        ]}
      />
    </div>
  );
};

export const Toggles = () => {
  const [checked, setChecked] = React.useState(true);
  const [plan, setPlan] = React.useState('pro');
  return (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
      <Checkbox label="Remember me" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <Switch label="Notifications" checked={checked} onChange={setChecked} />
      <RadioGroup
        name="plan"
        value={plan}
        onChange={(v) => setPlan(String(v))}
        options={[
          { label: 'Starter', value: 'starter' },
          { label: 'Pro', value: 'pro' },
          { label: 'Enterprise', value: 'ent', disabled: true },
        ]}
      />
    </div>
  );
};

export const Specialty = () => (
  <div style={{ display: 'grid', gap: '20px', maxWidth: '420px' }}>
    <FormField label="Wrapped field" htmlFor="wrapped">
      <input id="wrapped" placeholder="Custom control" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
    </FormField>
    <SearchInput onSearch={() => {}} />
    <OTPInput length={6} />
  </div>
);
