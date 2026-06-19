// ============================================================
// CampusCash Search
// Safe regex compiler + match highlighter
// ============================================================

/**
 * Safely compile a user-typed regex pattern.
 * Returns null if the pattern is empty or invalid.
 */
export function compileRegex(pattern, ignoreCase = true) {
  if (!pattern || pattern.trim() === "") return null;
  try {
    return new RegExp(pattern, ignoreCase ? "gi" : "g");
  } catch {
    return null; // invalid regex — silently ignore
  }
}

/**
 * Wrap regex matches in <mark> tags for highlighting.
 * Safe to call with null regex.
 */
export function highlight(text, regex) {
  if (!regex || !text) return text;
  // Reset lastIndex since we reuse the regex across calls
  regex.lastIndex = 0;
  return text.replace(regex, match => `<mark>${match}</mark>`);
}