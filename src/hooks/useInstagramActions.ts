"use client";

import { useState, useCallback } from "react";
import type { ProfileContext } from "@/lib/types";

export interface ActionStatusMap {
  [username: string]: "idle" | "loading" | "success" | "error";
}

export function useInstagramActions(profile: ProfileContext | null) {
  const [actionStatuses, setActionStatuses] = useState<ActionStatusMap>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Fast mobile deep-link intent: opens instagram://user?username=...
   * Falls back to https://www.instagram.com/...
   */
  const openInNativeApp = useCallback((username: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, "");
    const appUrl = `instagram://user?username=${clean}`;
    const webUrl = `https://www.instagram.com/${clean}/`;

    // Attempt to open native app protocol first
    const start = Date.now();
    window.location.href = appUrl;

    // If app didn't open within 1.2 seconds (e.g. desktop or app not installed), open web tab
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 1200);
  }, []);

  /**
   * Automated unfollow via server action proxy
   */
  const unfollowUser = useCallback(
    async (targetUsername: string): Promise<boolean> => {
      const clean = targetUsername.trim().toLowerCase().replace(/^@/, "");

      if (!profile?.sessionId || !profile?.csrfToken) {
        // Fallback to native app if not authenticated
        openInNativeApp(clean);
        return false;
      }

      setActionStatuses((prev) => ({ ...prev, [clean]: "loading" }));
      setErrorMessage(null);

      try {
        const res = await fetch("/api/instagram/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUsername: clean,
            action: "unfollow",
            sessionId: profile.sessionId,
            csrfToken: profile.csrfToken,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setActionStatuses((prev) => ({ ...prev, [clean]: "success" }));
          return true;
        }

        const msg = data.error || `Failed to unfollow @${clean}`;
        setErrorMessage(msg);
        setActionStatuses((prev) => ({ ...prev, [clean]: "error" }));
        return false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setErrorMessage(msg);
        setActionStatuses((prev) => ({ ...prev, [clean]: "error" }));
        return false;
      }
    },
    [profile, openInNativeApp]
  );

  /**
   * Automated follow via server action proxy
   */
  const followUser = useCallback(
    async (targetUsername: string): Promise<boolean> => {
      const clean = targetUsername.trim().toLowerCase().replace(/^@/, "");

      if (!profile?.sessionId || !profile?.csrfToken) {
        openInNativeApp(clean);
        return false;
      }

      setActionStatuses((prev) => ({ ...prev, [clean]: "loading" }));
      setErrorMessage(null);

      try {
        const res = await fetch("/api/instagram/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUsername: clean,
            action: "follow",
            sessionId: profile.sessionId,
            csrfToken: profile.csrfToken,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setActionStatuses((prev) => ({ ...prev, [clean]: "success" }));
          return true;
        }

        const msg = data.error || `Failed to follow @${clean}`;
        setErrorMessage(msg);
        setActionStatuses((prev) => ({ ...prev, [clean]: "error" }));
        return false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setErrorMessage(msg);
        setActionStatuses((prev) => ({ ...prev, [clean]: "error" }));
        return false;
      }
    },
    [profile, openInNativeApp]
  );

  return {
    actionStatuses,
    errorMessage,
    clearError: () => setErrorMessage(null),
    unfollowUser,
    followUser,
    openInNativeApp,
  };
}

