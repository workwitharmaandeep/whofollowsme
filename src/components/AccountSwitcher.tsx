"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Trash2, X } from "lucide-react";
import { getInitial } from "@/lib/utils";

interface AccountSwitcherProps {
  currentUsername?: string;
  accounts: string[];
  onSelectAccount: (username: string) => void;
  onNewUpload: () => void;
  onDeleteAccount?: (username: string) => void;
}

export default function AccountSwitcher({
  currentUsername,
  accounts,
  onSelectAccount,
  onNewUpload,
  onDeleteAccount,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setConfirmDelete(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanCurrent = currentUsername?.trim().toLowerCase().replace(/^@/, "");

  if (!currentUsername && accounts.length <= 1) {
    return null;
  }

  const handleDelete = (username: string) => {
    onDeleteAccount?.(username);
    setConfirmDelete(null);
    if (accounts.length <= 1) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setConfirmDelete(null);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer max-w-[170px] truncate"
        title="Switch active account"
      >
        <div className="w-4 h-4 rounded-full logo-gradient text-white flex items-center justify-center text-[9px] font-bold shrink-0">
          {cleanCurrent ? getInitial(cleanCurrent) : "@"}
        </div>
        <span className="truncate">
          {cleanCurrent ? `@${cleanCurrent}` : "Select Account"}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.08] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Your Accounts ({accounts.length})
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {accounts.map((acc) => {
              const clean = acc.toLowerCase().replace(/^@/, "");
              const isSelected = clean === cleanCurrent;
              const isConfirming = confirmDelete === clean;

              if (isConfirming) {
                return (
                  <div
                    key={acc}
                    className="flex items-center justify-between px-3 py-2 bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-100"
                  >
                    <span className="truncate font-medium text-[11px]">
                      Delete @{clean}?
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDelete(clean)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={acc}
                  className={`flex items-center justify-between px-3 py-1.5 text-xs transition-colors group ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectAccount(clean);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 min-w-0 flex-1 py-1 text-left cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full logo-gradient text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {getInitial(clean)}
                    </div>
                    <span className="truncate">@{clean}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 ml-1" />
                    )}
                  </button>

                  {onDeleteAccount && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(clean);
                      }}
                      className="p-1 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 opacity-70 group-hover:opacity-100 cursor-pointer"
                      title={`Delete @${clean} session`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-zinc-100 dark:border-white/[0.06] pt-1 mt-1">
            <button
              onClick={() => {
                onNewUpload();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Upload Another Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
