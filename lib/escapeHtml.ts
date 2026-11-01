/**
 * Escape a value for interpolation into HTML (text or quoted attribute).
 * Scraped listing fields and saved query values are untrusted, so anything
 * that ends up in an email body needs to go through this.
 */
export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
