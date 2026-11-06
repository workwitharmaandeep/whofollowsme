"use client";

import { useMemo } from "react";
import { Crown, Clock, TrendingUp, ExternalLink } from "lucide-react";
import { formatDate, relativeTime, getInitial, groupByYear } from "@/lib/utils";
import type { InstagramUser } from "@/lib/types";

interface TimelineViewProps {
  followers: InstagramUser[];
  dontFollowBack: InstagramUser[];
}

export default function TimelineView({
  followers,
  dontFollowBack,
}: TimelineViewProps) {
  // Day 1 Followers: earliest 20 followers still following today
  const day1Followers = useMemo(() => {
    return [...followers]
      .filter((u) => u.timestamp > 0)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 20);
  }, [followers]);

  // Oldest unreciprocated follows
  const oldestUnreciprocated = useMemo(() => {
    return [...dontFollowBack]
      .filter((u) => u.timestamp > 0)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 20);
  }, [dontFollowBack]);

  // Activity breakdown by year
  const yearBreakdown = useMemo(() => {
    const groups = groupByYear(followers.filter((u) => u.timestamp > 0));
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [followers]);

  const maxYearCount = Math.max(...yearBreakdown.map(([, c]) => c), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day 1 Followers */}
        <div className="card-clean overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/[0.04] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Day 1 Loyal Followers
              </h3>
              <p className="text-[10px] text-zinc-400">
                Earliest accounts that still follow you today
              </p>
            </div>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.03] max-h-96 overflow-y-auto">
            {day1Followers.length > 0 ? (
              day1Followers.map((user, i) => (
                <a
                  key={user.username}
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <span className="text-[11px] font-semibold text-zinc-400 w-5 text-right tabular-nums shrink-0">
                    #{i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
                    {getInitial(user.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-zinc-400" title={formatDate(user.timestamp)}>
                      Following since {relativeTime(user.timestamp)}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
                </a>
              ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-8">
                No timestamp data available
              </p>
            )}
          </div>
        </div>

        {/* Oldest Unreciprocated */}
        <div className="card-clean overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/[0.04] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Oldest Unreciprocated
              </h3>
              <p className="text-[10px] text-zinc-400">
                Accounts you followed the longest ago that never followed back
              </p>
            </div>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.03] max-h-96 overflow-y-auto">
            {oldestUnreciprocated.length > 0 ? (
              oldestUnreciprocated.map((user, i) => (
                <a
                  key={user.username}
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <span className="text-[11px] font-semibold text-zinc-400 w-5 text-right tabular-nums shrink-0">
                    #{i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
                    {getInitial(user.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-zinc-400" title={formatDate(user.timestamp)}>
                      You followed {relativeTime(user.timestamp)}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
                </a>
              ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-8">
                All followed accounts are reciprocal!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Followers by Year */}
      {yearBreakdown.length > 0 && (
        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Followers Joined by Year
            </h3>
          </div>
          <div className="space-y-2.5">
            {yearBreakdown.map(([year, count]) => {
              const pct = (count / maxYearCount) * 100;
              return (
                <div key={year} className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-zinc-500 font-semibold shrink-0 tabular-nums">
                    {year}
                  </span>
                  <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-zinc-600 dark:text-zinc-300 font-semibold tabular-nums shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
