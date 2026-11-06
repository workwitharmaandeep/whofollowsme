"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Heart,
  UserX,
  Clock,
  Star,
  UserMinus,
  ShieldOff,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CalendarDays,
  BarChart3,
  Download,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  History,
} from "lucide-react";
import type { InstagramData, RelationshipSets, Snapshot } from "@/lib/types";
import type { UsernameProfile } from "./UsernameChip";

interface ProfileDataViewProps {
  data: InstagramData;
  relationships: RelationshipSets;
  profile: UsernameProfile | null;
  snapshots?: Snapshot[];
  currentSnapshotId?: number;
  onSelectSnapshot?: (id: number) => void;
  onDeleteSnapshot?: (id: number) => void;
  onDeleteSession?: () => void;
}

interface StatRowProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}

function StatRow({ label, value, sub, color = "text-zinc-900 dark:text-white" }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-white/[0.04] last:border-0">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
        {sub && <div className="text-[10px] text-zinc-400">{sub}</div>}
      </div>
    </div>
  );
}

interface ExpandableListProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

function ExpandableList({ title, count, icon, color, bgColor, borderColor, children }: ExpandableListProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2.5">
          <span className={color}>{icon}</span>
          <span className={`text-xs font-semibold ${color}`}>{title}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${color}`}>
            {count}
          </span>
        </div>
        {count > 0 ? (
          open ? <ChevronUp className={`w-4 h-4 ${color}`} /> : <ChevronDown className={`w-4 h-4 ${color}`} />
        ) : (
          <span className="text-[10px] text-zinc-400">None</span>
        )}
      </button>
      {open && count > 0 && (
        <div className="border-t border-zinc-100/50 dark:border-white/[0.04] max-h-64 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function UserListItem({ username, href, timestamp }: { username: string; href: string; timestamp: number }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-100/50 dark:border-white/[0.03] last:border-0 hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-full logo-gradient flex items-center justify-center shrink-0">
          <span className="text-white text-[9px] font-bold uppercase">{username[0]}</span>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">@{username}</div>
          {timestamp > 0 && (
            <div className="text-[10px] text-zinc-400">
              {new Date(timestamp * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
      </div>
      <a
        href={href || `https://www.instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/[0.06] transition-colors"
        title="Open Instagram profile"
      >
        <ExternalLink className="w-3 h-3 text-zinc-400" />
      </a>
    </div>
  );
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ProfileDataView({
  data,
  relationships,
  profile,
  snapshots = [],
  currentSnapshotId,
  onSelectSnapshot,
  onDeleteSnapshot,
  onDeleteSession,
}: ProfileDataViewProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmDeleteSnapshotId, setConfirmDeleteSnapshotId] = useState<number | null>(null);
  const username = profile?.username ?? "you";

  const userSnapshots = useMemo(() => {
    if (!profile?.username) return snapshots;
    const clean = profile.username.trim().toLowerCase();
    return snapshots.filter((s) => s.username?.trim().toLowerCase() === clean);
  }, [snapshots, profile]);

  const followRatio = useMemo(() => {
    if (data.following.length === 0) return 0;
    return ((data.followers.length / data.following.length) * 100).toFixed(1);
  }, [data]);

  const mutualRatio = useMemo(() => {
    if (data.following.length === 0) return 0;
    return ((relationships.mutuals.length / data.following.length) * 100).toFixed(1);
  }, [data, relationships]);

  const oldestFollower = useMemo(() => {
    const sorted = [...data.followers].filter((u) => u.timestamp > 0).sort((a, b) => a.timestamp - b.timestamp);
    return sorted[0] ?? null;
  }, [data.followers]);

  const newestFollower = useMemo(() => {
    const sorted = [...data.followers].filter((u) => u.timestamp > 0).sort((a, b) => b.timestamp - a.timestamp);
    return sorted[0] ?? null;
  }, [data.followers]);

  const handleExportAll = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: username,
      stats: {
        followers: data.followers.length,
        following: data.following.length,
        mutuals: relationships.mutuals.length,
        dontFollowBack: relationships.dontFollowBack.length,
        fans: relationships.fans.length,
        pendingRequests: data.pendingRequests.length,
        recentlyUnfollowed: data.recentlyUnfollowed.length,
        closeFriends: data.closeFriends.length,
        restrictedProfiles: data.restrictedProfiles.length,
      },
      followers: data.followers,
      following: data.following,
      mutuals: relationships.mutuals,
      dontFollowBack: relationships.dontFollowBack,
      fans: relationships.fans,
      pendingRequests: data.pendingRequests,
      recentlyUnfollowed: data.recentlyUnfollowed,
      closeFriends: data.closeFriends,
      restrictedProfiles: data.restrictedProfiles,
    };
    downloadJSON(exportData, `whofollowsme-${username}-${new Date().toISOString().slice(0, 10)}.json`);
  };

  return (
    <div className="space-y-5 pb-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-clean p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full logo-gradient flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white text-2xl font-bold uppercase">{username[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">@{username}</h2>
            <Sparkles className="w-4 h-4 text-pink-500" />
            {profile && (
              <a
                href={`https://www.instagram.com/${username}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Open Profile <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Data exported from your Instagram ZIP • processed 100% in-browser
          </p>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Export all data as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          Export All Data
        </button>
      </motion.div>

      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Account stats */}
        <div className="card-clean p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Account Stats</h3>
          </div>
          <div>
            <StatRow label="Followers" value={data.followers.length.toLocaleString()} />
            <StatRow label="Following" value={data.following.length.toLocaleString()} />
            <StatRow
              label="Follower / Following Ratio"
              value={`${followRatio}%`}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatRow label="Mutuals" value={relationships.mutuals.length.toLocaleString()} sub={`${mutualRatio}% of following`} />
            <StatRow
              label="Don't Follow Back"
              value={relationships.dontFollowBack.length.toLocaleString()}
              color="text-rose-600 dark:text-rose-400"
            />
            <StatRow
              label="Fans (follow you, you don't follow)"
              value={relationships.fans.length.toLocaleString()}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatRow label="Pending Follow Requests" value={data.pendingRequests.length.toLocaleString()} />
            <StatRow label="Recently Unfollowed" value={data.recentlyUnfollowed.length.toLocaleString()} />
            <StatRow label="Close Friends" value={data.closeFriends.length.toLocaleString()} />
            <StatRow label="Restricted Profiles" value={data.restrictedProfiles.length.toLocaleString()} />
          </div>
        </div>

        {/* Timeline milestones */}
        <div className="card-clean p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Timeline Highlights</h3>
          </div>
          <div>
            {oldestFollower && (
              <StatRow
                label="Oldest Follower"
                value={`@${oldestFollower.username}`}
                sub={new Date(oldestFollower.timestamp * 1000).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                color="text-emerald-600 dark:text-emerald-400"
              />
            )}
            {newestFollower && (
              <StatRow
                label="Newest Follower"
                value={`@${newestFollower.username}`}
                sub={new Date(newestFollower.timestamp * 1000).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                color="text-violet-600 dark:text-violet-400"
              />
            )}
            <StatRow
              label="Data analysed"
              value={new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            />
            {data.followers.filter((u) => u.timestamp > 0).length === 0 && (
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                No timestamp data available in this export. Timestamps are included when you export JSON with date range &quot;All time&quot;.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* All lists */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2.5"
      >
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
          All Your Data — Click to expand
        </h3>

        <ExpandableList
          title="Followers"
          count={data.followers.length}
          icon={<Users className="w-4 h-4" />}
          color="text-zinc-700 dark:text-zinc-300"
          bgColor="bg-zinc-50 dark:bg-white/[0.01]"
          borderColor="border-zinc-200/70 dark:border-white/[0.06]"
        >
          {data.followers.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Following"
          count={data.following.length}
          icon={<UserCheck className="w-4 h-4" />}
          color="text-blue-700 dark:text-blue-300"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
          borderColor="border-blue-200/60 dark:border-blue-900/30"
        >
          {data.following.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Mutuals"
          count={relationships.mutuals.length}
          icon={<Heart className="w-4 h-4" />}
          color="text-emerald-700 dark:text-emerald-300"
          bgColor="bg-emerald-50 dark:bg-emerald-950/20"
          borderColor="border-emerald-200/60 dark:border-emerald-900/30"
        >
          {relationships.mutuals.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Don't Follow Back"
          count={relationships.dontFollowBack.length}
          icon={<UserX className="w-4 h-4" />}
          color="text-rose-700 dark:text-rose-300"
          bgColor="bg-rose-50 dark:bg-rose-950/20"
          borderColor="border-rose-200/60 dark:border-rose-900/30"
        >
          {relationships.dontFollowBack.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Fans (Follow You Only)"
          count={relationships.fans.length}
          icon={<Users className="w-4 h-4" />}
          color="text-violet-700 dark:text-violet-300"
          bgColor="bg-violet-50 dark:bg-violet-950/20"
          borderColor="border-violet-200/60 dark:border-violet-900/30"
        >
          {relationships.fans.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Pending Follow Requests"
          count={data.pendingRequests.length}
          icon={<Clock className="w-4 h-4" />}
          color="text-amber-700 dark:text-amber-300"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
          borderColor="border-amber-200/60 dark:border-amber-900/30"
        >
          {data.pendingRequests.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Recently Unfollowed"
          count={data.recentlyUnfollowed.length}
          icon={<UserMinus className="w-4 h-4" />}
          color="text-orange-700 dark:text-orange-300"
          bgColor="bg-orange-50 dark:bg-orange-950/20"
          borderColor="border-orange-200/60 dark:border-orange-900/30"
        >
          {data.recentlyUnfollowed.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Close Friends"
          count={data.closeFriends.length}
          icon={<Star className="w-4 h-4" />}
          color="text-yellow-700 dark:text-yellow-300"
          bgColor="bg-yellow-50 dark:bg-yellow-950/20"
          borderColor="border-yellow-200/60 dark:border-yellow-900/30"
        >
          {data.closeFriends.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>

        <ExpandableList
          title="Restricted Profiles"
          count={data.restrictedProfiles.length}
          icon={<ShieldOff className="w-4 h-4" />}
          color="text-zinc-600 dark:text-zinc-400"
          bgColor="bg-zinc-50 dark:bg-white/[0.01]"
          borderColor="border-zinc-200/60 dark:border-white/[0.06]"
        >
          {data.restrictedProfiles.map((u) => <UserListItem key={u.username} {...u} />)}
        </ExpandableList>
      </motion.div>

      {/* Saved Specific Sessions List */}
      {userSnapshots.length > 0 && (
        <div className="card-clean p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-500" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Saved Sessions for @{username} ({userSnapshots.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">
              Click trash to delete a specific session
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {userSnapshots.map((s) => {
              const isCurrent = currentSnapshotId === s.id;
              const isConfirming = confirmDeleteSnapshotId === s.id;
              const dateFormatted = new Date(s.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/70 dark:border-violet-900/40"
                      : "bg-zinc-50/50 dark:bg-white/[0.015] border-zinc-200/60 dark:border-white/[0.05]"
                  }`}
                >
                  {isConfirming ? (
                    <div className="flex items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-400">
                      <span className="font-semibold text-[11px]">
                        Delete session from {dateFormatted}?
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onDeleteSnapshot?.(s.id!);
                            setConfirmDeleteSnapshotId(null);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteSnapshotId(null)}
                          className="px-2 py-0.5 rounded text-[10px] text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {s.label || `Session (${dateFormatted})`}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {s.stats?.followersCount ?? Object.keys(s.followersMap || {}).length} followers · {s.stats?.followingCount ?? Object.keys(s.followingMap || {}).length} following
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isCurrent && onSelectSnapshot && (
                          <button
                            onClick={() => onSelectSnapshot(s.id!)}
                            className="px-2.5 py-1 text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                        {onDeleteSnapshot && (
                          <button
                            onClick={() => setConfirmDeleteSnapshotId(s.id!)}
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete this specific session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Management & Data Controls */}
      {onDeleteSession && (
        <div className="card-clean p-4 border-rose-200/60 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Session for @{username}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Permanently remove all saved snapshots, whitelists, and review history for this account from your browser.
            </p>
          </div>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0"
          >
            Delete Session
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Delete Session @{username}?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              All stored snapshots, diff comparisons, whitelists, and review history for <strong>@{username}</strong> will be permanently wiped from IndexedDB and local storage on this device.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  onDeleteSession?.();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy reminder */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          All data shown above came exclusively from your uploaded ZIP file and is computed in your browser&apos;s memory. No data is stored on any server. The &quot;Export All Data&quot; button downloads a JSON file to your device only.
        </p>
      </div>
    </div>
  );
}

