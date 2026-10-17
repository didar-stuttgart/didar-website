/**
 * CSV helpers for admin exports.
 * Neutralises spreadsheet formula injection: a cell starting with = + - @ (or tab/CR)
 * is prefixed with an apostrophe so Excel/Sheets treat it as text.
 */
export function csvCell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
