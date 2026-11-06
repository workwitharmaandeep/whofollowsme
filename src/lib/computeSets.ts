import type { InstagramUser, RelationshipSets, InstagramData } from "./types";

/**
 * Compute relationship sets using O(1) Set lookups.
 */
export function computeRelationships(data: InstagramData): RelationshipSets {
  const followersSet = new Set(data.followers.map((u) => u.username.toLowerCase()));
  const followingSet = new Set(data.following.map((u) => u.username.toLowerCase()));

  // Don't Follow Back: accounts you follow who do NOT follow you back
  const dontFollowBack = data.following.filter(
    (u) => !followersSet.has(u.username.toLowerCase())
  );

  // Mutuals: accounts you follow who also follow you back
  const mutuals = data.following.filter((u) =>
    followersSet.has(u.username.toLowerCase())
  );

  // Fans: accounts that follow you but you don't follow back
  const fans = data.followers.filter(
    (u) => !followingSet.has(u.username.toLowerCase())
  );

  return { dontFollowBack, mutuals, fans };
}

/**
 * Sort users by the given sort option.
 */
export function sortUsers(
  users: InstagramUser[],
  sort: "newest" | "oldest" | "az" | "za"
): InstagramUser[] {
  const sorted = [...users];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.timestamp - a.timestamp);
    case "oldest":
      return sorted.sort((a, b) => a.timestamp - b.timestamp);
    case "az":
      return sorted.sort((a, b) =>
        a.username.localeCompare(b.username, undefined, { sensitivity: "base" })
      );
    case "za":
      return sorted.sort((a, b) =>
        b.username.localeCompare(a.username, undefined, { sensitivity: "base" })
      );
    default:
      return sorted;
  }
}

/**
 * Filter users by search query (case-insensitive substring match on username).
 */
export function filterUsers(
  users: InstagramUser[],
  query: string
): InstagramUser[] {
  if (!query.trim()) return users;
  const q = query.toLowerCase().trim();
  return users.filter((u) => u.username.toLowerCase().includes(q));
}
