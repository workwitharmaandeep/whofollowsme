import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a Unix timestamp (seconds) to a human-readable date string.
 */
export function formatDate(timestamp: number): string {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get relative time string from a Unix timestamp (seconds).
 * e.g. "2 years, 3 months ago"
 */
export function relativeTime(timestamp: number): string {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const then = timestamp * 1000;
  const diffMs = now - then;

  if (diffMs < 0) return "In the future";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(months / 12);

  if (years > 0) {
    const remainingMonths = months % 12;
    if (remainingMonths > 0) {
      return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""} ago`;
    }
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Format an ISO date string to a readable label.
 */
export function formatSnapshotLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get the first character of a username for avatar placeholder.
 */
export function getInitial(username: string): string {
  return (username.charAt(0) || "?").toUpperCase();
}

/**
 * Group users by year based on their timestamp.
 */
export function groupByYear(
  users: { timestamp: number }[]
): Record<string, number> {
  const groups: Record<string, number> = {};
  for (const user of users) {
    if (!user.timestamp) continue;
    const year = new Date(user.timestamp * 1000).getFullYear().toString();
    groups[year] = (groups[year] || 0) + 1;
  }
  return groups;
}

/**
 * Reliably open/redirect to an Instagram profile on both mobile and desktop.
 * - On desktop: immediately opens https://www.instagram.com/<username>/ in a new tab without popup-blocker issues.
 * - On mobile: launches native instagram:// deep-link intent, falling back to web URL.
 */
export function openInstagramProfile(username: string, href?: string): void {
  if (typeof window === "undefined") return;
  const clean = username.trim().toLowerCase().replace(/^@/, "");
  const webUrl = href || `https://www.instagram.com/${clean}/`;
  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");

  if (isMobile) {
    const appUrl = `instagram://user?username=${clean}`;
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.location.href = webUrl;
      }
    }, 1200);
  } else {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}
