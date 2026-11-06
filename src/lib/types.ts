// ─── Raw entry from Instagram JSON ───
export interface RawInstagramEntry {
  title?: string;
  media_list_data?: unknown[];
  string_list_data?: Array<{
    href?: string;
    value?: string;
    timestamp?: number;
  }>;
  label_values?: Array<{
    label?: string;
    value?: string;
  }>;
  timestamp?: number;
}

// ─── Normalized user record ───
export interface InstagramUser {
  username: string;
  href: string;
  timestamp: number; // Unix epoch seconds
}

// ─── Complete parsed data from a ZIP ───
export interface InstagramData {
  detectedUsername?: string;
  followers: InstagramUser[];
  following: InstagramUser[];
  pendingRequests: InstagramUser[];
  recentlyUnfollowed: InstagramUser[];
  closeFriends: InstagramUser[];
  restrictedProfiles: InstagramUser[];
}

// ─── Computed relationship sets ───
export interface RelationshipSets {
  dontFollowBack: InstagramUser[];
  mutuals: InstagramUser[];
  fans: InstagramUser[];
}

// ─── IndexedDB snapshot ───
export interface Snapshot {
  id?: number;
  username?: string;
  date: string;
  label: string;
  followersMap: Record<string, InstagramUser>;
  followingMap: Record<string, InstagramUser>;
  pendingRequests?: InstagramUser[];
  recentlyUnfollowed?: InstagramUser[];
  closeFriends?: InstagramUser[];
  restrictedProfiles?: InstagramUser[];
  stats: {
    followersCount: number;
    followingCount: number;
    mutualsCount: number;
    dontFollowBackCount: number;
    fansCount: number;
  };
}

// ─── Snapshot diff result ───
export interface SnapshotDiff {
  lostFollowers: InstagramUser[];
  newFollowers: InstagramUser[];
  lostFollowing: InstagramUser[];
  newFollowing: InstagramUser[];
  previousDate: string;
  currentDate: string;
}

// ─── Sort options ───
export type SortOption = "newest" | "oldest" | "az" | "za";

// ─── Tab definition ───
export interface TabDef {
  id: string;
  label: string;
  count: number;
  iconName: string;
  warning?: boolean;
}


