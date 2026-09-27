import { Request, Response, NextFunction } from 'express';

export type ValidatorFn = (val: any) => string | null;

export interface ValidationSchema {
  body?: Record<string, ValidatorFn[]>;
  params?: Record<string, ValidatorFn[]>;
  query?: Record<string, ValidatorFn[]>;
}

/**
 * Common reusable validation rules
 */
export const rules = {
  required: (fieldName = 'Field'): ValidatorFn => (val) => {
    if (val === undefined || val === null || val === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  string: (fieldName = 'Field'): ValidatorFn => (val) => {
    if (val !== undefined && val !== null && typeof val !== 'string') {
      return `${fieldName} must be a string`;
    }
    return null;
  },

  number: (fieldName = 'Field'): ValidatorFn => (val) => {
    if (val !== undefined && val !== null && (isNaN(Number(val)) || typeof val === 'boolean')) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  positiveNumber: (fieldName = 'Field'): ValidatorFn => (val) => {
    if (val !== undefined && val !== null && (isNaN(Number(val)) || Number(val) <= 0)) {
      return `${fieldName} must be greater than 0`;
    }
    return null;
  },

  email: (fieldName = 'Email'): ValidatorFn => (val) => {
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim())) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  indianPhone: (fieldName = 'Mobile number'): ValidatorFn => (val) => {
    const clean = String(val || '').replace(/^\+91/, '').trim();
    if (val && !/^[6-9]\d{9}$/.test(clean)) {
      return `${fieldName} must be a valid 10-digit Indian mobile number`;
    }
    return null;
  },

  pincode: (fieldName = 'Pincode'): ValidatorFn => (val) => {
    if (val && !/^[1-9][0-9]{5}$/.test(String(val).trim())) {
      return `${fieldName} must be a valid 6-digit Indian PIN code`;
    }
    return null;
  },

  minLength: (min: number, fieldName = 'Field'): ValidatorFn => (val) => {
    if (val && String(val).length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  inArray: (allowed: any[], fieldName = 'Field'): ValidatorFn => (val) => {
    if (val && !allowed.includes(val)) {
      return `${fieldName} must be one of: ${allowed.join(', ')}`;
    }
    return null;
  },

  arrayNotEmpty: (fieldName = 'List'): ValidatorFn => (val) => {
    if (!Array.isArray(val) || val.length === 0) {
      return `${fieldName} must be a non-empty list`;
    }
    return null;
  },
};

/**
 * Declarative Request Validator Middleware
 * Validates request body, URL params, and query string with structured 400 response.
 */
export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { location: 'body' | 'params' | 'query'; field: string; message: string }[] = [];

    const check = (location: 'body' | 'params' | 'query') => {
      const rulesObj = schema[location];
      if (!rulesObj) return;

      const data = req[location] || {};

      for (const [field, validators] of Object.entries(rulesObj)) {
        const val = data[field];
        for (const validator of validators) {
          const err = validator(val);
          if (err) {
            errors.push({ location, field, message: err });
            break; // Stop at first failing rule for this field
          }
        }
      }
    };

    check('params');
    check('query');
    check('body');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    return next();
  };
}
