import Dexie, { type Table } from "dexie";
import type { Snapshot, SnapshotDiff, InstagramUser } from "./types";

class InstaPulseDB extends Dexie {
  snapshots!: Table<Snapshot, number>;

  constructor() {
    super("InstaPulseDB");
    this.version(1).stores({
      snapshots: "++id, date",
    });
    this.version(2).stores({
      snapshots: "++id, date, username",
    });
  }
}

export const db = new InstaPulseDB();

export async function saveSnapshot(
  snapshot: Omit<Snapshot, "id">
): Promise<number> {
  return db.snapshots.add(snapshot as Snapshot);
}

export async function getAllSnapshots(): Promise<Snapshot[]> {
  return db.snapshots.orderBy("date").reverse().toArray();
}

export async function getDistinctAccounts(): Promise<string[]> {
  const all = await getAllSnapshots();
  const seen = new Set<string>();
  const accounts: string[] = [];
  for (const s of all) {
    if (s.username) {
      const clean = s.username.trim().toLowerCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        accounts.push(s.username.trim());
      }
    }
  }
  return accounts;
}

export async function getSnapshotsForUser(username: string): Promise<Snapshot[]> {
  const clean = username.trim().toLowerCase();
  const all = await getAllSnapshots();
  return all.filter((s) => s.username?.trim().toLowerCase() === clean);
}

export async function getLatestSnapshotForUser(username: string): Promise<Snapshot | undefined> {
  const userSnapshots = await getSnapshotsForUser(username);
  return userSnapshots[0];
}

export async function getSnapshot(id: number): Promise<Snapshot | undefined> {
  return db.snapshots.get(id);
}

export async function deleteSnapshot(id: number): Promise<void> {
  return db.snapshots.delete(id);
}

export async function deleteSnapshotsForUser(username: string): Promise<number> {
  const clean = username.trim().toLowerCase();
  const all = await getAllSnapshots();
  const userSnaps = all.filter((s) => s.username?.trim().toLowerCase() === clean);
  const ids = userSnaps.map((s) => s.id).filter((id): id is number => typeof id === "number");
  await db.snapshots.bulkDelete(ids);
  return ids.length;
}

export async function clearAllSessionDataForUser(username: string): Promise<void> {
  const clean = username.trim().toLowerCase();
  await deleteSnapshotsForUser(username);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`whofollows_whitelist_${clean}`);
      localStorage.removeItem(`whofollows_visited_${clean}`);
      const stored = localStorage.getItem("whofollows_username");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.username?.trim().toLowerCase() === clean) {
          localStorage.removeItem("whofollows_username");
        }
      }
    } catch {
      /* ignore */
    }
  }
}

export function buildMaps(
  users: InstagramUser[]
): Record<string, InstagramUser> {
  const map: Record<string, InstagramUser> = {};
  for (const user of users) {
    map[user.username] = user;
  }
  return map;
}

export function diffSnapshots(
  previous: Snapshot,
  current: Snapshot
): SnapshotDiff {
  const prevFollowers = new Set(Object.keys(previous.followersMap));
  const currFollowers = new Set(Object.keys(current.followersMap));
  const prevFollowing = new Set(Object.keys(previous.followingMap));
  const currFollowing = new Set(Object.keys(current.followingMap));

  const lostFollowers: InstagramUser[] = [];
  for (const u of prevFollowers) {
    if (!currFollowers.has(u)) {
      lostFollowers.push(previous.followersMap[u]);
    }
  }

  const newFollowers: InstagramUser[] = [];
  for (const u of currFollowers) {
    if (!prevFollowers.has(u)) {
      newFollowers.push(current.followersMap[u]);
    }
  }

  const lostFollowing: InstagramUser[] = [];
  for (const u of prevFollowing) {
    if (!currFollowing.has(u)) {
      lostFollowing.push(previous.followingMap[u]);
    }
  }

  const newFollowing: InstagramUser[] = [];
  for (const u of currFollowing) {
    if (!prevFollowing.has(u)) {
      newFollowing.push(current.followingMap[u]);
    }
  }

  return {
    lostFollowers,
    newFollowers,
    lostFollowing,
    newFollowing,
    previousDate: previous.date,
    currentDate: current.date,
  };
}
