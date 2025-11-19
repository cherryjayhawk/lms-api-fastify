import path from "path";

/**
 * Sanitizes a filename by normalizing it to NFKD, replacing non-word, non-dot, non-hyphen characters with hyphens, 
 * replacing multiple hyphens with a single hyphen, and removing leading and trailing hyphens. 
 * Then it appends the file extension to the sanitized filename in lowercase and returns the result.
 * @param {string} filename - The filename to sanitize
 * @returns {string} The sanitized filename with its extension in lowercase
 */
export function sanitizer(filename: string): string {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  const sanitized = name
    .normalize("NFKD")
    .replace(/[^\w.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${sanitized}${ext.toLowerCase()}`;
}
