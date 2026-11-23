export const repositoryHref =
  "https://github.com/PolariSystem/sui-design-system";
export const figmaHref =
  "https://www.figma.com/design/2jnGtX6x5wYdoJDum40ovM/Serenity-UI---Design-System";

/** Donations are optional. Invalid or absent URLs never produce a visible action. */
export function donationHref(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export const supportHref = donationHref(import.meta.env.VITE_DONATION_URL);
