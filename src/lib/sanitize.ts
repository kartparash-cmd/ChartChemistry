/**
 * Basic input sanitization for user-provided strings.
 * Strips HTML tags and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate and sanitize an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize a name field — strip HTML, limit length.
 */
export function sanitizeName(name: string, maxLength = 100): string {
  return sanitizeInput(name).slice(0, maxLength);
}
