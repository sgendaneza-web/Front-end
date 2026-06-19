// ============================================================
// CampusCash Validators
// All regex patterns used for form validation
// ============================================================

// Rule 1: No leading/trailing spaces, not empty
const DESCRIPTION_REGEX = /^\S(?:.*\S)?$/;

// Rule 2: Valid number — integer or up to 2 decimal places
const AMOUNT_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Rule 3: Valid date — YYYY-MM-DD
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Rule 4: Category — letters, spaces, ampersands, hyphens
const CATEGORY_REGEX = /^[A-Za-z&]+(?:[ -][A-Za-z&]+)*$/;

// Rule 5 (ADVANCED): Back-reference to catch duplicate words
// e.g. "lunch lunch" or "the the"
const DUPLICATE_WORD_REGEX = /\b(\w+)\s+\1\b/i;

export function validateTransaction(data) {
  const errors = [];

  // Validate description
  if (!data.description || !DESCRIPTION_REGEX.test(data.description)) {
    errors.push("Description cannot start or end with spaces and must not be empty.");
  }

  // Advanced: catch duplicate words in description
  if (data.description && DUPLICATE_WORD_REGEX.test(data.description)) {
    errors.push("Description contains duplicate words (e.g. \"lunch lunch\").");
  }

  // Validate amount
  if (!data.amount || !AMOUNT_REGEX.test(String(data.amount))) {
    errors.push("Amount must be a valid positive number (max 2 decimal places).");
  }

  // Validate date
  if (!data.date || !DATE_REGEX.test(data.date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }

  // Validate category — allow "Books & Stationery" with & and spaces
  if (!data.category || !CATEGORY_REGEX.test(data.category)) {
    errors.push("Please select a valid category.");
  }

  return errors;
}

// Export patterns for use in tests.html / README
export const PATTERNS = {
  DESCRIPTION_REGEX,
  AMOUNT_REGEX,
  DATE_REGEX,
  CATEGORY_REGEX,
  DUPLICATE_WORD_REGEX
};