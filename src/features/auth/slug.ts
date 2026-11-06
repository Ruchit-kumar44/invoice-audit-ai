export function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base || "org"}-${suffix}`;
}