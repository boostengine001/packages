import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../index';

interface TestValues {
  email: string;
  name: string;
}

const initialValues: TestValues = { email: '', name: '' };

const validate = (values: TestValues) => {
  const errors: Partial<Record<keyof TestValues, string>> = {};
  if (!values.email.includes('@')) errors.email = 'Enter a valid email';
  if (!values.name.trim()) errors.name = 'Name is required';
  return errors;
};

describe('useForm', () => {
  it('starts with initial values and no errors', () => {
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate }));
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleChange updates a single field', () => {
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate }));
    act(() => result.current.handleChange('email', 'dev@boost.dev'));
    expect(result.current.values.email).toBe('dev@boost.dev');
    expect(result.current.values.name).toBe('');
  });

  it('handleBlur marks the field touched and surfaces its error', () => {
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate }));
    act(() => result.current.handleBlur('email'));
    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Enter a valid email');
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.getFieldError('email')).toBe('Enter a valid email');
  });

  it('re-validates a touched field as the user types', () => {
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate }));
    act(() => result.current.handleBlur('email'));
    act(() => result.current.handleChange('email', 'dev@boost.dev'));
    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.getFieldError('email')).toBeUndefined();
  });

  it('blocks submit and skips onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate, onSubmit }));
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.hasErrors).toBe(true);
    // All fields are marked touched after a submit attempt
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.name).toBe(true);
  });

  it('calls onSubmit with values on a valid submit and clears isSubmitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForm<TestValues>({
        initialValues: { email: 'dev@boost.dev', name: 'Rishabh' },
        validate,
        onSubmit,
      })
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ email: 'dev@boost.dev', name: 'Rishabh' });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('integrates with a Zod-style safeParse schema', async () => {
    const schema = {
      safeParse: (data: unknown) => {
        const d = data as TestValues;
        if (d.email.includes('@')) return { success: true } as const;
        return {
          success: false as const,
          error: { issues: [{ path: ['email'], message: 'Invalid email format' }] },
        };
      },
    };
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, schema }));
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errors.email).toBe('Invalid email format');

    act(() => result.current.handleChange('email', 'ok@boost.dev'));
    // handleChange only re-validates touched fields
    act(() => result.current.handleBlur('email'));
    expect(result.current.errors.email).toBeUndefined();
  });

  it('reset() restores initial state', () => {
    const { result } = renderHook(() => useForm<TestValues>({ initialValues, validate }));
    act(() => {
      result.current.handleChange('name', 'Rishabh');
      result.current.setFieldError('email', 'manual error');
    });
    act(() => result.current.reset());
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('validationSummary lists all error messages', async () => {
    const { result } = renderHook(() =>
      useForm<TestValues>({
        initialValues: { email: 'nope', name: '' },
        validate,
      })
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.validationSummary).toContain('Enter a valid email');
    expect(result.current.validationSummary).toContain('Name is required');
  });
});
