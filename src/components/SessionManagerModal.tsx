"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type { Snapshot } from "@/lib/types";

interface SessionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: Snapshot[];
  currentSnapshotId?: number;
  currentUsername?: string;
  onSelectSnapshot: (id: number) => void;
  onDeleteSnapshot: (id: number) => void;
}

export default function SessionManagerModal({
  isOpen,
  onClose,
  snapshots,
  currentSnapshotId,
  currentUsername,
  onSelectSnapshot,
  onDeleteSnapshot,
}: SessionManagerModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (!isOpen) return null;

  const cleanUser = currentUsername?.trim().toLowerCase();

  // Filter snapshots strictly belonging to the active user (if known)
  const userSnapshots = cleanUser
    ? snapshots.filter((s) => s.username?.trim().toLowerCase() === cleanUser)
    : snapshots;

  const handleDelete = (id: number) => {
    onDeleteSnapshot(id);
    setConfirmDeleteId(null);
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
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Saved Upload Sessions
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {cleanUser ? `Sessions for @${cleanUser}` : "All saved upload sessions"} ({userSnapshots.length})
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sessions List */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
                {userSnapshots.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <History className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      No saved sessions found
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                      Upload an official Instagram export ZIP to create your first session.
                    </p>
                  </div>
                ) : (
                  userSnapshots.map((s) => {
                    const isCurrent = currentSnapshotId === s.id;
                    const isConfirming = confirmDeleteId === s.id;
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
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? "bg-violet-50/60 dark:bg-violet-950/20 border-violet-200/80 dark:border-violet-900/40"
                            : "bg-zinc-50/60 dark:bg-white/[0.02] border-zinc-200/70 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        {isConfirming ? (
                          <div className="flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-400 animate-in fade-in duration-100">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span className="font-semibold">
                                Delete session from {dateFormatted}?
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleDelete(s.id!)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {s.label || `@${s.username || "user"} export`}
                                </span>
                                {isCurrent && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Active
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {dateFormatted}
                                </span>
                                <span>•</span>
                                <span>
                                  <strong>{s.stats?.followersCount ?? Object.keys(s.followersMap || {}).length}</strong> followers
                                </span>
                                <span>•</span>
                                <span>
                                  <strong>{s.stats?.followingCount ?? Object.keys(s.followingMap || {}).length}</strong> following
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isCurrent && (
                                <button
                                  onClick={() => {
                                    onSelectSnapshot(s.id!);
                                    onClose();
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs cursor-pointer"
                                  title="Switch to this session"
                                >
                                  <span>View</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                onClick={() => setConfirmDeleteId(s.id!)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete this specific session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-white/[0.06] text-center text-[11px] text-zinc-400">
                Sessions are stored strictly inside your browser&apos;s IndexedDB. Deleting a session permanently wipes it.
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

