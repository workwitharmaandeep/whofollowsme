"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown, ChevronUp, Check, X } from "lucide-react";

const STORAGE_KEY = "whofollows_username";

export interface UsernameProfile {
  username: string;
  setAt: string;
}

interface UsernameChipProps {
  onProfileSet: (profile: UsernameProfile | null) => void;
  currentProfile: UsernameProfile | null;
}

export default function UsernameChip({ onProfileSet, currentProfile }: UsernameChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UsernameProfile = JSON.parse(stored);
        return parsed.username || "";
      }
    } catch {
      /* ignore */
    }
    return "";
  });

  // Load persisted username on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UsernameProfile = JSON.parse(stored);
        onProfileSet(parsed);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = inputValue.trim().toLowerCase().replace(/^@/, "");
    if (!clean) return;

    const profile: UsernameProfile = { username: clean, setAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch { /* ignore */ }

    onProfileSet(profile);
    setIsExpanded(false);
  };

  const handleClear = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    onProfileSet(null);
    setInputValue("");
  };

  return (
    <div className="w-full">
      {/* Collapsed pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
              currentProfile ? "logo-gradient" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            {currentProfile ? currentProfile.username[0].toUpperCase() : <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {currentProfile ? `@${currentProfile.username}` : "Set your handle (optional)"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {currentProfile && (
            <span className="hidden sm:inline text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
              used for labels
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Expanded form */}
      {isExpanded && (
        <div className="mt-2 p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-white/[0.06] space-y-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Your handle is stored in your browser only — never sent anywhere. It&apos;s used to label your upload snapshots.
          </p>
          <form onSubmit={handleSave} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">@</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="your_handle"
                autoFocus
                className="w-full pl-7 pr-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            {currentProfile && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Clear handle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

