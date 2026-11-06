"use client";

import { motion } from "framer-motion";
import type { TabDef } from "@/lib/types";

interface TabBarProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="overflow-x-auto tab-scroll -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-zinc-200/70 dark:border-white/[0.06]">
      <div className="inline-flex gap-0 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${isActive
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              id={`tab-${tab.id}`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${isActive
                      ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.warning && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}

              {/* Animated underline */}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-t-full"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
