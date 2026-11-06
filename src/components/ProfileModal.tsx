"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Star,
  Calendar,
} from "lucide-react";
import type { InstagramUser } from "@/lib/types";
import type { UsernameProfile } from "@/components/UsernameChip";
import { formatDate, relativeTime, getInitial, openInstagramProfile } from "@/lib/utils";

interface ProfileModalProps {
  user: InstagramUser | null;
  isOpen: boolean;
  onClose: () => void;
  profile: UsernameProfile | null;
  isWhitelisted: boolean;
  isVisited: boolean;
  onToggleWhitelist: (username: string) => void;
  onMarkVisited: (username: string) => void;
  badge?: { label: string; color: string } | null;
  onActionSuccess?: (username: string, action: "unfollow" | "follow") => void;
}

export default function ProfileModal({
  user,
  isOpen,
  onClose,
  isWhitelisted,
  onToggleWhitelist,
  onMarkVisited,
  badge,
}: ProfileModalProps) {
  if (!isOpen || !user) return null;

  const handleOpenInInstagram = () => {
    onMarkVisited(user.username);
    openInstagramProfile(user.username, user.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet — slides up from bottom on mobile, centered on desktop */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[360px] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-200/70 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>

            {/* Close on desktop */}
            <button
              onClick={onClose}
              className="hidden sm:flex absolute top-3.5 right-3.5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Content */}
            <div className="px-5 pb-6 pt-4 space-y-5">
              {/* Profile header */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full logo-gradient text-white flex items-center justify-center text-2xl font-bold shrink-0">
                  {getInitial(user.username)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                    @{user.username}
                  </h3>
                  {user.timestamp > 0 && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span title={formatDate(user.timestamp)}>{relativeTime(user.timestamp)}</span>
                    </div>
                  )}
                  {badge && (
                    <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleOpenInInstagram}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Unfollow on Instagram
                </button>

                <button
                  onClick={() => onToggleWhitelist(user.username)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isWhitelisted
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Star
                    className="w-3.5 h-3.5"
                    fill={isWhitelisted ? "currentColor" : "none"}
                  />
                  {isWhitelisted ? "Whitelisted" : "Whitelist"}
                </button>
              </div>

              {/* Web link row */}
              <a
                href={user.href || `https://www.instagram.com/${user.username}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onMarkVisited(user.username)}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-0.5"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">instagram.com/{user.username}</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
