"use client";

import { useState, useMemo } from "react";
import { UserMinus, Search, ExternalLink, Calendar, Check, Download } from "lucide-react";
import { formatDate, relativeTime, getInitial } from "@/lib/utils";
import { exportAsCSV, exportAsTXT } from "@/lib/exportUtils";
import type { InstagramUser } from "@/lib/types";

interface RecentlyUnfollowedProps {
  users: InstagramUser[];
  visitedUsers?: Set<string>;
  onToggleVisited?: (username: string) => void;
}

export default function RecentlyUnfollowed({
  users,
  visitedUsers,
  onToggleVisited,
}: RecentlyUnfollowedProps) {
  const [search, setSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => b.timestamp - a.timestamp);
  }, [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((u) => u.username.toLowerCase().includes(q));
  }, [sorted, search]);

  if (users.length === 0) {
    return (
      <div className="card-clean text-center py-16 px-4">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-zinc-400">
          <UserMinus className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          No Recently Unfollowed Profiles
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
          No recently unfollowed accounts were recorded in this export archive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 card-clean">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <UserMinus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Unfollowed Activity Log
            </h3>
            <p className="text-[11px] text-zinc-400">
              {filtered.length} of {users.length} accounts recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter list..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl py-1 z-20">
                <button
                  onClick={() => {
                    exportAsCSV(filtered, "recently-unfollowed");
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => {
                    exportAsTXT(filtered, "recently-unfollowed");
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Download TXT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="card-clean divide-y divide-zinc-100 dark:divide-white/[0.04] overflow-hidden">
        {filtered.map((user, idx) => {
          const isVisited = visitedUsers?.has(user.username);
          return (
            <div
              key={user.username + idx}
              className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
                isVisited ? "opacity-60 bg-zinc-50/50 dark:bg-white/[0.01]" : "hover:bg-zinc-50/60 dark:hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-semibold text-xs shrink-0">
                  {getInitial(user.username)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {user.username}
                    </span>
                    {isVisited && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="w-2.5 h-2.5" /> Checked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span>Unfollowed {relativeTime(user.timestamp)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline" title={formatDate(user.timestamp)}>
                      {formatDate(user.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={user.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onToggleVisited?.(user.username)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors shrink-0"
              >
                <span>Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
