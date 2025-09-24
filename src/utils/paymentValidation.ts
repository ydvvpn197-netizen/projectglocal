/**
 * Payment validation utilities for security and validation
 */
import { BillingDetails, AddressDetails, PaymentMetadata } from '@/types/extended';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number, currency: string): PaymentValidationResult {
  const errors: string[] = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('Amount must be a valid number');
  }

  if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  // Currency-specific validations
  switch (currency.toLowerCase()) {
    case 'usd':
      if (amount < 50) {
        errors.push('Minimum amount for USD is $0.50');
      }
      if (amount > 99999999) {
        errors.push('Maximum amount for USD is $999,999.99');
      }
      break;
    case 'eur':
      if (amount < 50) {
        errors.push('Minimum amount for EUR is €0.50');
      }
      if (amount > 99999999) {
        errors.push('Maximum amount for EUR is €999,999.99');
      }
      break;
    case 'gbp':
      if (amount < 50) {
        errors.push('Minimum amount for GBP is £0.50');
      }
      if (amount > 99999999) {
        errors.push('Maximum amount for GBP is £999,999.99');
      }
      break;
    default:
      if (amount < 50) {
        errors.push('Minimum amount is 0.50 in the specified currency');
      }
      if (amount > 99999999) {
        errors.push('Maximum amount is 999,999.99 in the specified currency');
      }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): PaymentValidationResult {
  const errors: string[] = [];
  const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'];

  if (!currency || typeof currency !== 'string') {
    errors.push('Currency is required');
  } else if (!supportedCurrencies.includes(currency.toLowerCase())) {
    errors.push(`Currency ${currency} is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate payment method types
 */
export function validatePaymentMethodTypes(paymentMethodTypes: string[]): PaymentValidationResult {
  const errors: string[] = [];
  const supportedTypes = ['card', 'bank_transfer', 'sepa_debit', 'sofort'];

  if (!Array.isArray(paymentMethodTypes)) {
    errors.push('Payment method types must be an array');
  } else if (paymentMethodTypes.length === 0) {
    errors.push('At least one payment method type is required');
  } else {
    for (const type of paymentMethodTypes) {
      if (!supportedTypes.includes(type)) {
        errors.push(`Payment method type ${type} is not supported`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate billing details
 */
export function validateBillingDetails(billingDetails: BillingDetails): PaymentValidationResult {
  const errors: string[] = [];

  if (!billingDetails) {
    errors.push('Billing details are required');
    return { isValid: false, errors };
  }

  if (billingDetails.name && typeof billingDetails.name !== 'string') {
    errors.push('Name must be a string');
  }

  if (billingDetails.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingDetails.email)) {
      errors.push('Invalid email format');
    }
  }

  if (billingDetails.phone && typeof billingDetails.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (billingDetails.address) {
    const addressErrors = validateAddress(billingDetails.address);
    errors.push(...addressErrors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate address
 */
function validateAddress(address: AddressDetails): string[] {
  const errors: string[] = [];

  if (typeof address !== 'object' || address === null) {
    errors.push('Address must be an object');
    return errors;
  }

  if (address.line1 && typeof address.line1 !== 'string') {
    errors.push('Address line1 must be a string');
  }

  if (address.city && typeof address.city !== 'string') {
    errors.push('City must be a string');
  }

  if (address.state && typeof address.state !== 'string') {
    errors.push('State must be a string');
  }

  if (address.postal_code && typeof address.postal_code !== 'string') {
    errors.push('Postal code must be a string');
  }

  if (address.country && typeof address.country !== 'string') {
    errors.push('Country must be a string');
  }

  return errors;
}

/**
 * Validate payment metadata
 */
export function validatePaymentMetadata(metadata: PaymentMetadata): PaymentValidationResult {
  const errors: string[] = [];

  if (metadata && typeof metadata !== 'object') {
    errors.push('Metadata must be an object');
  } else if (metadata) {
    // Check for sensitive data in metadata
    const sensitiveKeys = ['password', 'ssn', 'credit_card', 'card_number', 'cvv'];
    for (const key of Object.keys(metadata)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        errors.push(`Metadata contains sensitive information: ${key}`);
      }
    }

    // Check metadata size (Stripe limit is 500 characters total)
    const metadataString = JSON.stringify(metadata);
    if (metadataString.length > 500) {
      errors.push('Metadata exceeds 500 character limit');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete payment data
 */
export function validatePaymentData(paymentData: {
  amount: number;
  currency: string;
  payment_method_types?: string[];
  billing_details?: BillingDetails;
  metadata?: PaymentMetadata;
  description?: string;
}): PaymentValidationResult {
  const errors: string[] = [];

  // Validate amount
  const amountValidation = validatePaymentAmount(paymentData.amount, paymentData.currency);
  errors.push(...amountValidation.errors);

  // Validate currency
  const currencyValidation = validateCurrency(paymentData.currency);
  errors.push(...currencyValidation.errors);

  // Validate payment method types
  if (paymentData.payment_method_types) {
    const paymentMethodValidation = validatePaymentMethodTypes(paymentData.payment_method_types);
    errors.push(...paymentMethodValidation.errors);
  }

  // Validate billing details
  if (paymentData.billing_details) {
    const billingValidation = validateBillingDetails(paymentData.billing_details);
    errors.push(...billingValidation.errors);
  }

  // Validate metadata
  if (paymentData.metadata) {
    const metadataValidation = validatePaymentMetadata(paymentData.metadata);
    errors.push(...metadataValidation.errors);
  }

  // Validate description
  if (paymentData.description && typeof paymentData.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (paymentData.description && paymentData.description.length > 500) {
    errors.push('Description exceeds 500 character limit');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize payment data for logging (remove sensitive information)
 */
export function sanitizePaymentData(paymentData: PaymentData): SanitizedPaymentData {
  const sanitized = { ...paymentData };

  // Remove sensitive fields
  const sensitiveFields = [
    'card_number', 'cvv', 'cvc', 'card_cvc', 'card_cvv',
    'password', 'ssn', 'social_security_number',
    'account_number', 'routing_number'
  ];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Mask card numbers if present
  if (sanitized.number) {
    sanitized.number = sanitized.number.replace(/\d(?=\d{4})/g, '*');
  }

  // Mask billing details
  if (sanitized.billing_details) {
    sanitized.billing_details = {
      ...sanitized.billing_details,
      name: sanitized.billing_details.name ? '[REDACTED]' : undefined,
      email: sanitized.billing_details.email ? '[REDACTED]' : undefined,
      phone: sanitized.billing_details.phone ? '[REDACTED]' : undefined
    };
  }

  return sanitized;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
  const currencyMap: Record<string, string> = {
    usd: 'USD',
    eur: 'EUR',
    gbp: 'GBP',
    cad: 'CAD',
    aud: 'AUD',
    jpy: 'JPY'
  };

  const currencyCode = currencyMap[currency.toLowerCase()] || currency.toUpperCase();

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100);
}

/**
 * Calculate tax amount based on rate and amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100));
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(amount: number, taxRate: number): number {
  return amount + calculateTax(amount, taxRate);
}

/**
 * Validate tax rate
 */
export function validateTaxRate(taxRate: number): PaymentValidationResult {
  const errors: string[] = [];

  if (typeof taxRate !== 'number' || isNaN(taxRate)) {
    errors.push('Tax rate must be a valid number');
  }

  if (taxRate < 0) {
    errors.push('Tax rate cannot be negative');
  }

  if (taxRate > 100) {
    errors.push('Tax rate cannot exceed 100%');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
