/**
 * Bridge3 Academy — Email Normalization & Validation
 *
 * Normalizes emails to prevent duplicate referrals and sybil attacks:
 * - Lowercases address
 * - For Gmail/Googlemail: strips dots and +aliases (e.g. john.doe+crypto@gmail.com -> johndoe@gmail.com)
 * - Identifies disposable / temporary email domains
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "temp-mail.org",
  "fakeinbox.com",
  "generator.email",
]);

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";

  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return trimmed;

  let local = trimmed.substring(0, atIndex);
  let domain = trimmed.substring(atIndex + 1);

  // Normalize googlemail to gmail
  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }

  // Gmail-specific rules: ignore dots and ignore +tag suffixes
  if (domain === "gmail.com") {
    local = local.split("+")[0];
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return false;

  const domain = email.substring(atIndex + 1).toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(domain);
}
