/**
 * Capitalizes the first letter of each word while preserving the rest
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''
    )
    .join(' ');
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts text to camelCase
 */
export function toCamelCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Converts text to PascalCase
 */
export function toPascalCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts text to kebab-case (URL-friendly)
 */
export function toKebabCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Truncates text with ellipsis at specified length
 */
export function truncate(text: string, length: number): string {
  if (!text || length <= 0) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

/**
 * Removes extra spaces from text
 */
export function removeExtraSpaces(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}
