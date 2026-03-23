/**
 * Basic input sanitization for user-provided strings.
 * Strips HTML tags (complete and incomplete), encodes HTML entities, and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  return (
    input
      // Strip complete HTML tags
      .replace(/<[^>]*>/g, "")
      // Strip incomplete HTML tags (e.g., "<script" without closing ">")
      .replace(/<[^>]*$/g, "")
      // Encode HTML entities
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim()
  );
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
