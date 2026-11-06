"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ShieldAlert, Star, ExternalLink, Shield } from "lucide-react";
import { formatDate, relativeTime, getInitial } from "@/lib/utils";
import type { InstagramUser } from "@/lib/types";

interface CloseFriendsAuditProps {
  closeFriends: InstagramUser[];
  restrictedProfiles: InstagramUser[];
  followers: InstagramUser[];
  following: InstagramUser[];
}

export default function CloseFriendsAudit({
  closeFriends,
  restrictedProfiles,
  followers,
  following,
}: CloseFriendsAuditProps) {
  const [filter, setFilter] = useState<"all" | "unreciprocated" | "mutual">("all");
  const [activeSection, setActiveSection] = useState<"close-friends" | "restricted">("close-friends");

  const followersSet = useMemo(() => new Set(followers.map((u) => u.username.toLowerCase())), [followers]);
  const followingSet = useMemo(() => new Set(following.map((u) => u.username.toLowerCase())), [following]);

  // Analyze close friends follow-back status
  const auditedCloseFriends = useMemo(() => {
    return closeFriends.map((user) => {
      const lower = user.username.toLowerCase();
      const followsYou = followersSet.has(lower);
      const youFollow = followingSet.has(lower);

      let status: "mutual" | "unreciprocated" | "fan" | "not_following";
      if (followsYou && youFollow) {
        status = "mutual";
      } else if (!followsYou && youFollow) {
        status = "unreciprocated";
      } else if (followsYou && !youFollow) {
        status = "fan";
      } else {
        status = "not_following";
      }

      return { ...user, status, followsYou, youFollow };
    });
  }, [closeFriends, followersSet, followingSet]);

  const unreciprocatedFriends = useMemo(
    () => auditedCloseFriends.filter((u) => !u.followsYou),
    [auditedCloseFriends]
  );

  const filteredFriends = useMemo(() => {
    if (filter === "unreciprocated") {
      return auditedCloseFriends.filter((u) => !u.followsYou);
    }
    if (filter === "mutual") {
      return auditedCloseFriends.filter((u) => u.status === "mutual");
    }
    return auditedCloseFriends;
  }, [auditedCloseFriends, filter]);

  return (
    <div className="space-y-4">
      {/* Alert Banner if any close friend doesn't follow back */}
      {unreciprocatedFriends.length > 0 ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-200">
              {unreciprocatedFriends.length}{" "}
              {unreciprocatedFriends.length === 1 ? "Close Friend" : "Close Friends"} Don&apos;t Follow You Back
            </h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5 leading-relaxed">
              These profiles can see your Close Friends stories, but are not in your followers list.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            100% Reciprocal: All accounts in your Close Friends list follow you back.
          </p>
        </div>
      )}

      {/* Section Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200/60 dark:border-white/[0.06]">
          <button
            onClick={() => setActiveSection("close-friends")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "close-friends"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Close Friends ({closeFriends.length})</span>
          </button>
          <button
            onClick={() => setActiveSection("restricted")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "restricted"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            <Shield className="w-3 h-3 text-violet-500" />
            <span>Restricted / Blocked ({restrictedProfiles.length})</span>
          </button>
        </div>

        {activeSection === "close-friends" && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unreciprocated")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === "unreciprocated"
                  ? "bg-rose-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              Unreciprocated ({unreciprocatedFriends.length})
            </button>
            <button
              onClick={() => setFilter("mutual")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === "mutual"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              Mutual ({auditedCloseFriends.length - unreciprocatedFriends.length})
            </button>
          </div>
        )}
      </div>

      {/* Accounts Grid */}
      {activeSection === "close-friends" ? (
        filteredFriends.length === 0 ? (
          <div className="card-clean py-12 text-center text-zinc-400 text-xs">
            No accounts match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredFriends.map((user) => (
              <div
                key={user.username}
                className={`card-clean p-3.5 flex items-center justify-between gap-3 ${
                  !user.followsYou
                    ? "border-rose-200 dark:border-rose-900/30 bg-rose-500/[0.02]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center shrink-0">
                    {getInitial(user.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {user.username}
                    </p>
                    <div className="mt-0.5">
                      {!user.followsYou ? (
                        <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                          Doesn&apos;t Follow Back
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Mutual Follower
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors shrink-0"
                  title="Open on Instagram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )
      ) : (
        restrictedProfiles.length === 0 ? (
          <div className="card-clean py-12 text-center text-zinc-400 text-xs">
            No restricted or blocked profiles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {restrictedProfiles.map((user) => (
              <div
                key={user.username}
                className="card-clean p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center shrink-0">
                    {getInitial(user.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {user.username}
                    </p>
                    {user.timestamp > 0 && (
                      <p className="text-[10px] text-zinc-400 truncate" title={formatDate(user.timestamp)}>
                        Added {relativeTime(user.timestamp)}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors shrink-0"
                  title="Open on Instagram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
