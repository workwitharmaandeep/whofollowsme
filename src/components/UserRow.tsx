"use client";

import { useState } from "react";
import { Star, ExternalLink, Check, UserMinus } from "lucide-react";
import { formatDate, relativeTime, getInitial, openInstagramProfile } from "@/lib/utils";
import type { InstagramUser } from "@/lib/types";

interface UserRowProps {
  user: InstagramUser;
  isWhitelisted: boolean;
  isVisited: boolean;
  onToggleWhitelist: (username: string) => void;
  onMarkVisited: (username: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (username: string) => void;
  showWhitelist?: boolean;
  badge?: { label: string; color: string } | null;
  onOpenProfileModal?: (user: InstagramUser) => void;
}

export default function UserRow({
  user,
  isWhitelisted,
  isVisited,
  onToggleWhitelist,
  onMarkVisited,
  isSelected,
  onToggleSelect,
  showWhitelist = true,
  badge,
  onOpenProfileModal,
}: UserRowProps) {
  const [isUnfollowed, setIsUnfollowed] = useState(false);

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkVisited(user.username);
    setIsUnfollowed(true);
    // Directly redirect / open that user's profile on Instagram
    openInstagramProfile(user.username, user.href);
  };

  return (
    <div
      onClick={() => onOpenProfileModal?.(user)}
      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-100 group cursor-pointer ${
        isVisited || isUnfollowed
          ? "opacity-45"
          : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
      }`}
    >
      {/* Checkbox */}
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(user.username);
          }}
          className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-violet-600 focus:ring-0 cursor-pointer shrink-0"
        />
      )}

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full logo-gradient text-white flex items-center justify-center text-xs font-bold shrink-0">
        {getInitial(user.username)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            @{user.username}
          </span>
          {isUnfollowed && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-rose-500 dark:text-rose-400 shrink-0">
              <Check className="w-2.5 h-2.5" /> Opened
            </span>
          )}
          {!isUnfollowed && badge && (
            <span className={`text-[10px] font-medium px-1.5 py-px rounded-md shrink-0 ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
        {user.timestamp > 0 && (
          <p className="text-[11px] text-zinc-400 mt-0.5" title={formatDate(user.timestamp)}>
            {relativeTime(user.timestamp)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Whitelist */}
        {showWhitelist && (
          <button
            onClick={() => onToggleWhitelist(user.username)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isWhitelisted
                ? "text-amber-500"
                : "text-zinc-300 dark:text-zinc-600 hover:text-amber-400"
            }`}
            title={isWhitelisted ? "Remove from whitelist" : "Whitelist"}
          >
            <Star className="w-3.5 h-3.5" fill={isWhitelisted ? "currentColor" : "none"} />
          </button>
        )}

        {/* Unfollow → redirects to that user ID on Instagram */}
        <button
          onClick={handleUnfollow}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-zinc-200/60 dark:border-white/[0.06]"
          title={`Redirect to @${user.username} on Instagram to unfollow`}
        >
          <UserMinus className="w-3 h-3 text-rose-500" />
          <span>Unfollow</span>
        </button>

        {/* Web link */}
        <a
          href={user.href || `https://www.instagram.com/${user.username}/`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onMarkVisited(user.username)}
          className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={`Open @${user.username} on Instagram`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
