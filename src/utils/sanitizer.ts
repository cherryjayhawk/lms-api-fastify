import path from "path";

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
