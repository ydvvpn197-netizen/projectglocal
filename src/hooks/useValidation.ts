import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateData, validatePartialData } from '@/utils/validation';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Validate data
  const validate = useCallback((data: unknown): ValidationResult<T> => {
    const result = validateData(schema, data);
    setErrors(result.errors || []);
    setIsValid(result.success);
    return result;
  }, [schema]);

  // Validate partial data
  const validatePartial = useCallback((data: Partial<T>): ValidationResult<T> => {
    const result = validatePartialData(schema, data);
    setErrors(result.errors || []);
    setIsValid(result.success);
    return result;
  }, [schema]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  // Get field error
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors.find(error => error.startsWith(fieldName));
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return errors.some(error => error.startsWith(fieldName));
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    validatePartial,
    clearErrors,
    getFieldError,
    hasFieldError
  };
};

// Hook for form validation
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  // Update form data
  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when updating
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback((): ValidationResult<T> => {
    const result = validatePartialData(schema, formData);
    
    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      const fieldErrors: Record<string, string> = {};
      result.errors?.forEach(error => {
        const [field] = error.split(':');
        fieldErrors[field] = error;
      });
      setErrors(fieldErrors);
      setIsValid(false);
    }

    return result;
  }, [schema, formData]);

  // Validate single field
  const validateField = useCallback((field: keyof T, value: unknown): boolean => {
    const fieldSchema = schema.shape[field];
    if (!fieldSchema) return true;

    try {
      fieldSchema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid value';
        setErrors(prev => ({
          ...prev,
          [field as string]: errorMessage
        }));
      }
      return false;
    }
  }, [schema]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({});
    setErrors({});
    setIsValid(false);
  }, []);

  // Get field error
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors[field as string];
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return !!errors[field as string];
  }, [errors]);

  return {
    formData,
    errors,
    isValid,
    updateField,
    validateForm,
    validateField,
    resetForm,
    getFieldError,
    hasFieldError
  };
};

// Hook for real-time validation
export const useRealTimeValidation = <T>(schema: z.ZodSchema<T>) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Validate field in real-time
  const validateField = useCallback(async (field: keyof T, value: unknown) => {
    setIsValidating(true);
    
    try {
      const fieldSchema = schema.shape[field];
      if (!fieldSchema) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      }

      await fieldSchema.parseAsync(value);
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid value';
        setFieldErrors(prev => ({
          ...prev,
          [field as string]: errorMessage
        }));
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema]);

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  // Get field error
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return fieldErrors[field as string];
  }, [fieldErrors]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return !!fieldErrors[field as string];
  }, [fieldErrors]);

  // Check if any field has error
  const hasAnyError = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    isValidating,
    validateField,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    hasAnyError
  };
};
