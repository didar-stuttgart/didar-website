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

/** UTF-8 byte order mark. Excel on Windows needs it to read a CSV as UTF-8 (Persian/German text). */
export const CSV_BOM = '\uFEFF';

/** Builds the full CSV text: BOM + header row + data rows, every cell escaped via csvCell. */
export function buildCsv(headers, rows) {
  return CSV_BOM + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
