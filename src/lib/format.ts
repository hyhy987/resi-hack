/**
 * Format expiry time as "Xh Ym" or "Xm" or "Expired"
 */
export function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Format expiry with "remaining" suffix for detail views
 */
export function formatExpiryWithSuffix(expiresAt: string): string {
  const base = formatExpiry(expiresAt);
  return base === "Expired" ? base : `${base} remaining`;
}

/**
 * Hours until expiry (for urgency styling)
 */
export function hoursUntilExpiry(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff / (1000 * 60 * 60);
}
