"use client";

import { ExportButton } from "./ExportButton";
import SearchSortBar from "./SearchSortBar";
import UserRow from "./UserRow";
import ProfileModal from "./ProfileModal";
import { usePagination } from "@/hooks/usePagination";
import { sortUsers, filterUsers } from "@/lib/computeSets";
import type { InstagramUser, SortOption } from "@/lib/types";
import type { UsernameProfile } from "@/components/UsernameChip";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  EyeOff,
  Eye,
  RotateCcw,
} from "lucide-react";

interface UserTableProps {
  users: InstagramUser[];
  whitelistSet: Set<string>;
  visitedSet: Set<string>;
  onToggleWhitelist: (username: string) => void;
  onMarkVisited: (username: string) => void;
  onBulkWhitelist?: (usernames: string[]) => void;
  onResetVisited?: () => void;
  showWhitelist?: boolean;
  hideWhitelisted?: boolean;
  tabLabel: string;
  badgeGetter?: (user: InstagramUser) => { label: string; color: string } | null;
  profile?: UsernameProfile | null;
}

export default function UserTable({
  users,
  whitelistSet,
  visitedSet,
  onToggleWhitelist,
  onMarkVisited,
  onBulkWhitelist,
  onResetVisited,
  showWhitelist = true,
  hideWhitelisted = false,
  tabLabel,
  badgeGetter,
  profile,
}: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [hideChecked, setHideChecked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [modalUser, setModalUser] = useState<InstagramUser | null>(null);

  const processedUsers = useMemo(() => {
    let result = [...users];
    if (hideWhitelisted) result = result.filter((u) => !whitelistSet.has(u.username));
    if (hideChecked) result = result.filter((u) => !visitedSet.has(u.username));
    result = filterUsers(result, searchQuery);
    result = sortUsers(result, sortOption);
    return result;
  }, [users, whitelistSet, visitedSet, hideWhitelisted, hideChecked, searchQuery, sortOption]);

  const { currentPage, totalPages, startIndex, endIndex, nextPage, prevPage, resetPage, hasNextPage, hasPrevPage } =
    usePagination({ totalItems: processedUsers.length, itemsPerPage: 50 });

  const pageUsers = processedUsers.slice(startIndex, endIndex);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    resetPage();
  }, [resetPage]);

  const handleSortChange = useCallback((s: SortOption) => {
    setSortOption(s);
    resetPage();
  }, [resetPage]);

  const toggleSelect = useCallback((username: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    const allSelected = pageUsers.every((u) => selectedUsers.has(u.username));
    if (allSelected) {
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        for (const u of pageUsers) next.delete(u.username);
        return next;
      });
    } else {
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        for (const u of pageUsers) next.add(u.username);
        return next;
      });
    }
  }, [pageUsers, selectedUsers]);

  const allOnPageSelected =
    pageUsers.length > 0 && pageUsers.every((u) => selectedUsers.has(u.username));

  return (
    <div className="space-y-3">
      {/* Search + Sort */}
      <SearchSortBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        totalCount={users.length}
        filteredCount={processedUsers.length}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setHideChecked(!hideChecked)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200/70 dark:border-white/[0.06] transition-colors cursor-pointer"
          >
            {hideChecked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {hideChecked ? "Show reviewed" : "Hide reviewed"}
          </button>

          {onResetVisited && (
            <button
              onClick={onResetVisited}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200/70 dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

          {onBulkWhitelist && selectedUsers.size > 0 && (
            <button
              onClick={() => {
                onBulkWhitelist(Array.from(selectedUsers));
                setSelectedUsers(new Set());
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3 fill-amber-500" />
              Whitelist {selectedUsers.size}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pageUsers.length > 0 && (
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={selectAllOnPage}
                className="w-3 h-3 rounded border-zinc-300 dark:border-zinc-700 text-violet-600 focus:ring-0 cursor-pointer"
              />
              Select page
            </label>
          )}
          <ExportButton users={processedUsers} filename={tabLabel} />
        </div>
      </div>

      {/* Table */}
      <div className="card divide-y divide-zinc-100/80 dark:divide-white/[0.04] overflow-hidden">
        <AnimatePresence mode="wait">
          {pageUsers.length > 0 ? (
            <motion.div
              key={`${currentPage}-${searchQuery}-${sortOption}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="divide-y divide-zinc-100/80 dark:divide-white/[0.04]"
            >
              {pageUsers.map((user) => (
                <UserRow
                  key={user.username}
                  user={user}
                  isWhitelisted={whitelistSet.has(user.username)}
                  isVisited={visitedSet.has(user.username)}
                  onToggleWhitelist={onToggleWhitelist}
                  onMarkVisited={onMarkVisited}
                  isSelected={selectedUsers.has(user.username)}
                  onToggleSelect={toggleSelect}
                  showWhitelist={showWhitelist}
                  badge={badgeGetter?.(user) ?? null}
                  profile={profile}
                  onOpenProfileModal={(u) => setModalUser(u)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="py-14 text-center">
              <p className="text-xs text-zinc-400">No matching accounts</p>
              {searchQuery && (
                <p className="text-[11px] text-zinc-500 mt-1">Clear the search to show all</p>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/70 dark:border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="text-[11px] text-zinc-400 tabular-nums">
            {startIndex + 1}–{Math.min(endIndex, processedUsers.length)} of {processedUsers.length}
          </span>
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/70 dark:border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile modal */}
      {modalUser && (
        <ProfileModal
          user={modalUser}
          isOpen={Boolean(modalUser)}
          onClose={() => setModalUser(null)}
          profile={profile ?? null}
          isWhitelisted={whitelistSet.has(modalUser.username)}
          isVisited={visitedSet.has(modalUser.username)}
          onToggleWhitelist={onToggleWhitelist}
          onMarkVisited={onMarkVisited}
          badge={badgeGetter?.(modalUser) ?? null}
        />
      )}
    </div>
  );
}
