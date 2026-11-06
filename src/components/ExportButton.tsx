"use client";

import { Download, FileText, Table } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { exportAsCSV, exportAsTXT } from "@/lib/exportUtils";
import type { InstagramUser } from "@/lib/types";

interface ExportButtonProps {
  users: InstagramUser[];
  filename: string;
}

export function ExportButton({ users, filename }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
          <button
            onClick={() => {
              exportAsCSV(users, filename);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            Export as CSV
          </button>
          <button
            onClick={() => {
              exportAsTXT(users, filename);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Export as TXT
          </button>
        </div>
      )}
    </div>
  );
}
