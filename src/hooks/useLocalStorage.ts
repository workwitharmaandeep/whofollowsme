"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * SSR-safe localStorage hook — uses lazy initializer to avoid setState-in-effect.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initializer runs once synchronously — no useEffect needed, no cascading render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Setter that also persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error writing localStorage key "${key}":`, error);
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
/**
 * Whitelist hook — manages a Set of whitelisted usernames scoped per Instagram account.
 */
export function useWhitelist(accountUsername?: string) {
  const cleanAccount = accountUsername?.trim().toLowerCase().replace(/^@/, "");
  const storageKey = cleanAccount
    ? `whofollows_whitelist_${cleanAccount}`
    : "whofollowsme_whitelist_default";

  const [list, setList] = useLocalStorage<string[]>(
    storageKey,
    []
  );

  const whitelistSet = useMemo(() => new Set(list), [list]);

  const add = useCallback(
    (username: string) => {
      setList((prev) => {
        if (prev.includes(username)) return prev;
        return [...prev, username];
      });
    },
    [setList]
  );

  const remove = useCallback(
    (username: string) => {
      setList((prev) => prev.filter((u) => u !== username));
    },
    [setList]
  );

  const toggle = useCallback(
    (username: string) => {
      if (whitelistSet.has(username)) {
        remove(username);
      } else {
        add(username);
      }
    },
    [whitelistSet, add, remove]
  );

  const bulkAdd = useCallback(
    (usernames: string[]) => {
      setList((prev) => {
        const set = new Set(prev);
        for (const u of usernames) set.add(u);
        return Array.from(set);
      });
    },
    [setList]
  );

  return { whitelistSet, add, remove, toggle, bulkAdd, list };
}

/**
 * Visited hook — tracks which usernames have been visited/checked scoped per Instagram account.
 */
export function useVisited(accountUsername?: string) {
  const cleanAccount = accountUsername?.trim().toLowerCase().replace(/^@/, "");
  const storageKey = cleanAccount
    ? `whofollows_visited_${cleanAccount}`
    : "whofollowsme_visited_default";

  const [list, setList] = useLocalStorage<string[]>(
    storageKey,
    []
  );

  const visitedSet = useMemo(() => new Set(list), [list]);

  const markVisited = useCallback(
    (username: string) => {
      const lower = username.toLowerCase();
      setList((prev) => {
        if (prev.includes(lower)) return prev;
        return [...prev, lower];
      });
    },
    [setList]
  );

  const resetAll = useCallback(() => {
    setList([]);
  }, [setList]);

  return { visitedSet, markVisited, resetAll, list };
}
