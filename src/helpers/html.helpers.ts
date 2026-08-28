const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[&<>"']/g, char => HTML_ESCAPES[char] ?? char);
}
