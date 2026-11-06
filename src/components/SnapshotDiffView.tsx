"use client";

import { useState, useEffect } from "react";
import { UserMinus, UserPlus, CalendarDays, ExternalLink, Trash2 } from "lucide-react";
import { getAllSnapshots, diffSnapshots, getSnapshot, deleteSnapshot } from "@/lib/storage";
import { formatSnapshotLabel, relativeTime, getInitial } from "@/lib/utils";
import type { Snapshot, SnapshotDiff, InstagramUser } from "@/lib/types";

interface SnapshotDiffViewProps {
  currentSnapshot: Snapshot;
}

function UserCard({ user }: { user: InstagramUser }) {
  return (
    <a
      href={user.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
    >
      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
        {getInitial(user.username)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {user.username}
        </p>
        {user.timestamp > 0 && (
          <p className="text-[10px] text-zinc-400">{relativeTime(user.timestamp)}</p>
        )}
      </div>
      <ExternalLink className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
    </a>
  );
}

export default function SnapshotDiffView({
  currentSnapshot,
}: SnapshotDiffViewProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(
    null
  );
  const [diff, setDiff] = useState<SnapshotDiff | null>(null);
  const [loading, setLoading] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    getAllSnapshots()
      .then((all) => {
        if (ignore) return;
        const currUser = currentSnapshot.username?.toLowerCase();
        // Strictly isolate snapshots belonging to this specific account
        const pastSnapshots = all.filter(
          (s) =>
            s.id !== currentSnapshot.id &&
            Boolean(currUser && s.username?.toLowerCase() === currUser)
        );
        setSnapshots(pastSnapshots);
        if (pastSnapshots.length > 0) {
          setSelectedSnapshotId((prev) =>
            pastSnapshots.some((s) => s.id === prev) ? prev : pastSnapshots[0].id!
          );
        } else {
          setSelectedSnapshotId(null);
        }
      })
      .catch((err) => console.warn("Failed to load snapshots:", err));

    return () => {
      ignore = true;
    };
  }, [currentSnapshot, refreshTrigger]);

  const handleDeleteSnapshot = async (id: number) => {
    try {
      await deleteSnapshot(id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.warn("Failed to delete snapshot:", err);
    }
  };

  useEffect(() => {
    async function computeDiff() {
      if (!selectedSnapshotId) {
        setDiff(null);
        return;
      }
      setLoading(true);
      try {
        const previous = await getSnapshot(selectedSnapshotId);
        if (previous) {
          const result = diffSnapshots(previous, currentSnapshot);
          setDiff(result);
        }
      } catch (err) {
        console.error("Diff computation error:", err);
      } finally {
        setLoading(false);
      }
    }
    computeDiff();
  }, [selectedSnapshotId, currentSnapshot]);

  const hasSnapshots = snapshots.length > 0;

  return (
    <div className="space-y-4">
      {/* Top Selector Card */}
      <div className="card-clean p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Snapshot Comparison
            </h3>
            <p className="text-[11px] text-zinc-400">
              Compare current upload against previous sessions
            </p>
          </div>
        </div>

        {hasSnapshots ? (
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSnapshotId ?? ""}
              onChange={(e) => setSelectedSnapshotId(Number(e.target.value))}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  Compare with: {s.label || formatSnapshotLabel(s.date)}
                </option>
              ))}
            </select>
            {selectedSnapshotId && (
              <button
                onClick={() => handleDeleteSnapshot(selectedSnapshotId)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete this comparison snapshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-400">
            {currentSnapshot.username
              ? `Upload another export for @${currentSnapshot.username} to see changes over time`
              : "Upload another export to compare changes over time"}
          </span>
        )}
      </div>

      {/* Diff Results */}
      {loading ? (
        <div className="card-clean py-12 text-center text-xs text-zinc-400">
          Calculating differences between exports...
        </div>
      ) : diff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lost Followers */}
          <div className="card-clean overflow-hidden">
            <div className="p-3.5 border-b border-zinc-100 dark:border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Lost Followers
                </h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                {diff.lostFollowers.length}
              </span>
            </div>
            <div className="p-2 divide-y divide-zinc-100 dark:divide-white/[0.03] max-h-80 overflow-y-auto">
              {diff.lostFollowers.length > 0 ? (
                diff.lostFollowers.map((user) => (
                  <UserCard key={user.username} user={user} />
                ))
              ) : (
                <p className="text-xs text-zinc-400 text-center py-8">
                  Zero lost followers since last snapshot!
                </p>
              )}
            </div>
          </div>

          {/* New Followers */}
          <div className="card-clean overflow-hidden">
            <div className="p-3.5 border-b border-zinc-100 dark:border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  New Followers
                </h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                {diff.newFollowers.length}
              </span>
            </div>
            <div className="p-2 divide-y divide-zinc-100 dark:divide-white/[0.03] max-h-80 overflow-y-auto">
              {diff.newFollowers.length > 0 ? (
                diff.newFollowers.map((user) => (
                  <UserCard key={user.username} user={user} />
                ))
              ) : (
                <p className="text-xs text-zinc-400 text-center py-8">
                  No new followers since last snapshot
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-clean py-14 text-center">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Upload another export in the future to track lost followers
          </p>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
            Your current export has been safely saved to IndexedDB. Next time you upload, you will see exactly who unfollowed or followed you.
          </p>
        </div>
      )}
    </div>
  );
}

