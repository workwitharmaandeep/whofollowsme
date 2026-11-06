"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Trash2, History } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AccountSwitcher from "./AccountSwitcher";
import SessionManagerModal from "./SessionManagerModal";
import type { Snapshot } from "@/lib/types";
import type { UsernameProfile } from "./UsernameChip";

interface NavbarProps {
  snapshots: Snapshot[];
  selectedSnapshotId: number | null;
  currentSnapshotId?: number;
  onSelectSnapshot: (id: number | null) => void;
  hasData: boolean;
  onReset: () => void;
  currentProfile?: UsernameProfile | null;
  allAccounts?: string[];
  onSelectAccount?: (username: string) => void;
  onDeleteAccount?: (username: string) => void;
  onDeleteSnapshot?: (id: number) => void;
}

export default function Navbar({
  snapshots,
  selectedSnapshotId,
  currentSnapshotId,
  onSelectSnapshot,
  hasData,
  onReset,
  currentProfile,
  allAccounts = [],
  onSelectAccount,
  onDeleteAccount,
  onDeleteSnapshot,
}: NavbarProps) {
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);

  // Only show snapshots belonging strictly to the active account
  const accountSnapshots = useMemo(() => {
    if (!currentProfile?.username) return snapshots;
    const clean = currentProfile.username.toLowerCase();
    return snapshots.filter((s) => s.username?.toLowerCase() === clean);
  }, [snapshots, currentProfile]);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-[#09090b]/85 border-b border-zinc-200/60 dark:border-white/[0.06] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Brand */}
            <button
              onClick={hasData ? onReset : undefined}
              className={`flex items-center gap-2.5 text-left focus:outline-none ${hasData ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="w-7 h-7 rounded-lg logo-gradient flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5C4 1.5 2 3.5 2 7s2 5.5 5 5.5 5-2.5 5-5.5-2-5.5-5-5.5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="9.5" cy="4.5" r="0.8" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">
                WhoFollowsMe
              </span>
            </button>

            {/* Center: Privacy pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>All data stays in your browser</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Account Switcher (if multiple accounts or active session) */}
              {allAccounts.length > 0 && onSelectAccount && (
                <AccountSwitcher
                  currentUsername={currentProfile?.username}
                  accounts={allAccounts}
                  onSelectAccount={onSelectAccount}
                  onNewUpload={onReset}
                  onDeleteAccount={onDeleteAccount}
                />
              )}

              {/* Sessions Manager Button */}
              {hasData && accountSnapshots.length > 0 && (
                <button
                  onClick={() => setIsSessionManagerOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  title="Manage all saved upload sessions"
                >
                  <History className="w-3.5 h-3.5 text-violet-500" />
                  <span className="hidden sm:inline">Sessions</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {accountSnapshots.length}
                  </span>
                </button>
              )}

              {/* Snapshot Selector (strictly for this account) */}
              {hasData && accountSnapshots.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  <select
                    value={selectedSnapshotId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      onSelectSnapshot(val ? Number(val) : null);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer max-w-[140px] sm:max-w-[170px] truncate"
                  >
                    <option value="">
                      {currentProfile?.username
                        ? `@${currentProfile.username} (Current)`
                        : "Current Session"}
                    </option>
                    {accountSnapshots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {selectedSnapshotId !== null && onDeleteSnapshot && (
                    <button
                      onClick={() => onDeleteSnapshot(selectedSnapshotId)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete this historical session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Sessions Manager Modal */}
      <SessionManagerModal
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        snapshots={snapshots}
        currentSnapshotId={currentSnapshotId ?? (selectedSnapshotId !== null ? selectedSnapshotId : undefined)}
        currentUsername={currentProfile?.username}
        onSelectSnapshot={(id) => {
          onSelectSnapshot(id);
          setIsSessionManagerOpen(false);
        }}
        onDeleteSnapshot={(id) => {
          onDeleteSnapshot?.(id);
        }}
      />
    </>
  );
}
