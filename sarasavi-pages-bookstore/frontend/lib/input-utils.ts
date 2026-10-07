/**
 * Input sanitization and length limiter utilities
 * Enforces standard character and digit limits across forms.
 * Prevents over-typing beyond valid digit counts.
 */

/**
 * Limits and formats a phone number so it cannot exceed the standard digit count.
 * Sri Lanka standard:
 *  - Local with leading 0: exactly 10 digits (e.g. 077 123 4567 or 011 234 5678)
 *  - International (+94): exactly 11 digits (e.g. +94 77 123 4567)
 *  - Raw 9-digit (without 0): max 9 digits (e.g. 77 123 4567)
 * Once the required numbers are filled, typing stops automatically.
 */
export function formatAndLimitPhone(input: string): string {
  if (!input) return '';

  const trimmed = input.trimStart();
  const startsWithPlus = trimmed.startsWith('+');
  
  // Extract all digits only
  let digits = input.replace(/\D/g, '');

  if (startsWithPlus || digits.startsWith('94')) {
    if (digits.startsWith('94')) {
      // Sri Lanka (+94): 94 + max 9 subscriber digits = exactly 11 digits total
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

  // Local phone number starting with 0: exactly 10 digits max (e.g. 077 123 4567 or 011 234 5678)
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
 * Keyboard event listener that actively blocks typing once max digits are reached,
 * and restricts input to numeric characters and standard navigation keys.
 */
export function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  // Allow control/navigation keys, copy/paste, backspace, delete, tab
  if (
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) ||
    e.ctrlKey || e.metaKey || e.altKey
  ) {
    return;
  }

  const input = e.currentTarget;
  const currentVal = input.value;
  const selectionLength = (input.selectionEnd || 0) - (input.selectionStart || 0);

  // If user has highlighted text, they are replacing, so allow
  if (selectionLength > 0) return;

  const digits = currentVal.replace(/\D/g, '');
  const isIntl = currentVal.trimStart().startsWith('+') || digits.startsWith('94');
  const isLocal = digits.startsWith('0');

  // Allow '+' only as the first character
  if (e.key === '+') {
    if (currentVal.length === 0 || (input.selectionStart === 0 && !currentVal.includes('+'))) {
      return;
    }
    e.preventDefault();
    return;
  }

  // Block any non-digit character (e.g. letters, symbols)
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  // Strictly enforce digit limits:
  // 1. Local number (07X XXX XXXX): exactly 10 digits
  if (isLocal && digits.length >= 10) {
    e.preventDefault();
    return;
  }
  // 2. Sri Lankan international (+94 XX XXX XXXX): exactly 11 digits (94 + 9 digits)
  if (isIntl && digits.startsWith('94') && digits.length >= 11) {
    e.preventDefault();
    return;
  }
  // 3. Raw number without prefix: exactly 9 digits
  if (!isLocal && !isIntl && digits.length >= 9) {
    e.preventDefault();
    return;
  }
}

/**
 * Limits credit/debit card numbers to exactly 16 digits (or max 19 formatted chars).
 * Automatically stops typing once 16 digits are entered.
 */
export function formatAndLimitCardNumber(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Limits card expiry to MM/YY format (4 digits max, 5 chars with slash).
 * Automatically stops typing once MM/YY is filled.
 */
export function formatAndLimitCardExpiry(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    const mm = Math.min(12, Math.max(1, Number(digits.slice(0, 2))));
    const mmStr = mm < 10 && digits.length >= 2 ? `0${mm}` : `${digits.slice(0, 2)}`;
    return `${mmStr}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Limits postal code to 5 digits max (Sri Lanka postal codes are 5 digits).
 * Automatically stops typing once 5 digits are entered.
 */
export function limitPostalCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}

/**
 * Limits CVV/CVC to 3 or 4 digits max.
 * Automatically stops typing once 4 digits are entered.
 */
export function limitCvv(input: string): string {
  return input.replace(/\D/g, '').slice(0, 4);
}

/**
 * Limits ISBN number to 13 digits max (or formatted with standard hyphens).
 * Automatically stops typing once 13 digits are entered.
 */
export function formatAndLimitIsbn(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length <= 12) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
}

/**
 * Limits Sri Lankan National Identity Card (NIC) input:
 * - Old format: 9 digits + V/X (10 chars, e.g. 991234567V)
 * - New format: 12 digits (12 chars, e.g. 200012345678)
 * Max length is capped at 12 characters.
 */
export function limitNic(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^0-9VX]/g, '');
  return cleaned.slice(0, 12);
}

/**
 * Limits integer numbers up to a maximum digit count or ceiling value.
 */
export function limitNumericInput(input: string | number, maxDigits: number = 6): number {
  const digits = String(input).replace(/\D/g, '').slice(0, maxDigits);
  return digits ? Number(digits) : 0;
}
