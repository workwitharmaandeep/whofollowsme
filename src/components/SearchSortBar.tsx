"use client";

import { Search } from "lucide-react";
import type { SortOption } from "@/lib/types";

interface SearchSortBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export default function SearchSortBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  totalCount,
  filteredCount,
}: SearchSortBarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
        <input
          type="text"
          placeholder="Filter usernames..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.07] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
          id="search-input"
        />
      </div>

      {/* Count */}
      {filteredCount !== totalCount && (
        <span className="text-[11px] text-zinc-400 tabular-nums whitespace-nowrap">
          {filteredCount} of {totalCount}
        </span>
      )}

      {/* Sort */}
      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="text-xs px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.07] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
        id="sort-select"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>
    </div>
  );
}
