/**
 * Input sanitization and length limiter utilities
 * Enforces standard character and digit limits across forms.
 */

/**
 * Limits and formats a phone number so it cannot exceed the standard digit count.
 * Sri Lanka standard:
 *  - Local: exactly 10 digits (e.g., 077 123 4567 or 011 234 5678)
 *  - International (+94): exactly 11 digits (e.g., +94 77 123 4567)
 *  - Raw 9-digit (without 0): max 9 digits (e.g., 77 123 4567)
 * Once the required numbers are filled, typing stops automatically.
 */
export function formatAndLimitPhone(input: string): string {
  if (!input) return '';

  const trimmed = input.trimStart();
  const startsWithPlus = trimmed.startsWith('+');
  
  // Extract all digits only
  let digits = input.replace(/\D/g, '');

  if (startsWithPlus) {
    if (digits.startsWith('94')) {
      // Sri Lanka (+94): 94 + max 9 subscriber digits = 11 digits total
      digits = digits.slice(0, 11);
      const sub = digits.slice(2);
      if (sub.length > 5) {
        return `+94 ${sub.slice(0, 2)} ${sub.slice(2, 5)} ${sub.slice(5)}`;
      } else if (sub.length > 2) {
        return `+94 ${sub.slice(0, 2)} ${sub.slice(2)}`;
      } else if (sub.length > 0) {
        return `+94 ${sub}`;
      }
      return '+94';
    } else {
      // General international: max 15 digits (ITU-T E.164 standard)
      digits = digits.slice(0, 15);
      return `+${digits}`;
    }
  }

  // Local phone number starting with 0: exactly 10 digits max (e.g. 077 123 4567)
  if (digits.startsWith('0')) {
    digits = digits.slice(0, 10);
    if (digits.length > 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length > 3) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return digits;
  }

  // Number typed without leading 0 or + (e.g., 771234567): max 9 digits
  if (digits.length > 0) {
    digits = digits.slice(0, 9);
    if (digits.length > 5) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    } else if (digits.length > 2) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    }
    return digits;
  }

  return '';
}

/**
 * Limits postal code to 5 digits max (Sri Lanka postal codes are 5 digits).
 */
export function limitPostalCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}

/**
 * Limits CVV to 3 or 4 digits max.
 */
export function limitCvv(input: string): string {
  return input.replace(/\D/g, '').slice(0, 4);
}
