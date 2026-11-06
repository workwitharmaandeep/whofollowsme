"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import OnboardingGuide from "@/components/OnboardingGuide";
import DropZone from "@/components/DropZone";
import Dashboard from "@/components/Dashboard";
import UsernameChip from "@/components/UsernameChip";
import { computeRelationships } from "@/lib/computeSets";
import {
  saveSnapshot,
  getAllSnapshots,
  getSnapshot,
  deleteSnapshot,
  clearAllSessionDataForUser,
} from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import type { InstagramData, RelationshipSets, Snapshot } from "@/lib/types";
import type { UsernameProfile } from "@/components/UsernameChip";
import { ShieldCheck, Lock, Database, Eye, Users, Trash2 } from "lucide-react";

export default function Home() {
  useTheme();

  const [data, setData] = useState<InstagramData | null>(null);
  const [relationships, setRelationships] = useState<RelationshipSets | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<Snapshot | undefined>(undefined);
  const [previousSnapshot, setPreviousSnapshot] = useState<Snapshot | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [profile, setProfile] = useState<UsernameProfile | null>(null);

  const refreshSnapshots = useCallback(async () => {
    try {
      const all = await getAllSnapshots();
      setSnapshots(all);
    } catch (e) {
      console.warn("IndexedDB load error:", e);
    }
  }, []);

  useEffect(() => {
    getAllSnapshots()
      .then(setSnapshots)
      .catch((e) => console.warn("IndexedDB load error:", e));
  }, []);

  // Compute distinct accounts across all snapshots and active profile
  const allAccounts = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const s of snapshots) {
      if (s.username) {
        const clean = s.username.trim().toLowerCase();
        if (!seen.has(clean)) {
          seen.add(clean);
          list.push(s.username.trim());
        }
      }
    }
    if (profile?.username) {
      const clean = profile.username.trim().toLowerCase();
      if (!seen.has(clean)) {
        list.push(profile.username.trim());
      }
    }
    return list;
  }, [snapshots, profile]);

  const handleReset = useCallback(() => {
    setData(null);
    setRelationships(null);
    setCurrentSnapshot(undefined);
    setPreviousSnapshot(null);
    setSelectedSnapshotId(null);
    setProfile(null);
    try {
      localStorage.removeItem("whofollows_username");
    } catch {
      /* ignore */
    }
  }, []);

  const handleSelectSnapshot = useCallback(
    async (id: number | null) => {
      setSelectedSnapshotId(id);
      if (id === null) return;

      try {
        const snap = await getSnapshot(id);
        if (snap) {
          setCurrentSnapshot(snap);
          const followers = Object.values(snap.followersMap || {});
          const following = Object.values(snap.followingMap || {});
          const reconstructedData: InstagramData = {
            detectedUsername: snap.username,
            followers,
            following,
            pendingRequests: snap.pendingRequests || [],
            recentlyUnfollowed: snap.recentlyUnfollowed || [],
            closeFriends: snap.closeFriends || [],
            restrictedProfiles: snap.restrictedProfiles || [],
          };
          setData(reconstructedData);
          setRelationships(computeRelationships(reconstructedData));

          // Set active profile to match this snapshot's username
          if (snap.username) {
            const p: UsernameProfile = { username: snap.username, setAt: snap.date };
            setProfile(p);
            try {
              localStorage.setItem("whofollows_username", JSON.stringify(p));
            } catch {
              /* ignore */
            }

            // Find prior snapshot strictly for this user (older than this snap)
            const clean = snap.username.trim().toLowerCase();
            const snapTime = new Date(snap.date).getTime();
            const olderUserSnaps = snapshots.filter(
              (s) =>
                s.username?.trim().toLowerCase() === clean &&
                s.id !== snap.id &&
                new Date(s.date).getTime() < snapTime
            );
            setPreviousSnapshot(olderUserSnaps[0] || null);
          } else {
            setPreviousSnapshot(null);
          }
        }
      } catch (err) {
        console.warn("Failed to load historical snapshot:", err);
      }
    },
    [snapshots]
  );


  // Switch between saved accounts strictly without data contamination
  const handleSelectAccount = useCallback(
    async (targetUsername: string) => {
      const clean = targetUsername.trim().toLowerCase();
      // Filter snapshots strictly belonging to targetUsername (sorted newest first)
      const userSnaps = snapshots.filter(
        (s) => s.username?.trim().toLowerCase() === clean
      );
      if (userSnaps.length === 0) return;

      const latest = userSnaps[0];
      const prior = userSnaps.length > 1 ? userSnaps[1] : null;

      const followers = Object.values(latest.followersMap || {});
      const following = Object.values(latest.followingMap || {});
      const reconstructedData: InstagramData = {
        detectedUsername: latest.username,
        followers,
        following,
        pendingRequests: latest.pendingRequests || [],
        recentlyUnfollowed: latest.recentlyUnfollowed || [],
        closeFriends: latest.closeFriends || [],
        restrictedProfiles: latest.restrictedProfiles || [],
      };

      const rels = computeRelationships(reconstructedData);
      const targetProfile: UsernameProfile = {
        username: latest.username || targetUsername,
        setAt: latest.date,
      };

      setProfile(targetProfile);
      try {
        localStorage.setItem("whofollows_username", JSON.stringify(targetProfile));
      } catch {
        /* ignore */
      }

      setData(reconstructedData);
      setRelationships(rels);
      setCurrentSnapshot(latest);
      setPreviousSnapshot(prior);
      setSelectedSnapshotId(latest.id ?? null);
    },
    [snapshots]
  );

  // Delete entire session (all snapshots, whitelists, review states) for a user
  const handleDeleteAccount = useCallback(
    async (targetUsername: string) => {
      const clean = targetUsername.trim().toLowerCase();
      try {
        await clearAllSessionDataForUser(clean);
        const refreshed = await getAllSnapshots();
        setSnapshots(refreshed);

        // Check if currently active account was the one deleted
        const activeClean = profile?.username?.trim().toLowerCase();
        if (activeClean === clean) {
          // Find remaining accounts
          const remainingAccounts = Array.from(
            new Set(
              refreshed
                .map((s) => s.username?.trim().toLowerCase())
                .filter((u): u is string => Boolean(u))
            )
          );

          if (remainingAccounts.length > 0) {
            await handleSelectAccount(remainingAccounts[0]);
          } else {
            handleReset();
          }
        }
      } catch (err) {
        console.warn("Failed to delete account session:", err);
      }
    },
    [profile, handleSelectAccount, handleReset]
  );

  // Delete an individual historical snapshot
  const handleDeleteSnapshot = useCallback(
    async (id: number) => {
      try {
        await deleteSnapshot(id);
        const refreshed = await getAllSnapshots();
        setSnapshots(refreshed);

        const isCurrentlyViewed = currentSnapshot?.id === id || selectedSnapshotId === id;
        if (isCurrentlyViewed) {
          if (profile?.username) {
            const clean = profile.username.trim().toLowerCase();
            const userSnaps = refreshed.filter(
              (s) => s.username?.trim().toLowerCase() === clean
            );
            if (userSnaps.length > 0) {
              await handleSelectSnapshot(userSnaps[0].id ?? null);
            } else {
              handleReset();
            }
          } else {
            handleReset();
          }
        }
      } catch (err) {
        console.warn("Failed to delete snapshot:", err);
      }
    },
    [currentSnapshot, selectedSnapshotId, profile, handleSelectSnapshot, handleReset]
  );

  const handleDataParsed = useCallback(
    async (parsedData: InstagramData, customLabel?: string) => {
      const rels = computeRelationships(parsedData);

      // Auto-detect and set profile handle from ZIP export
      const detectedId = parsedData.detectedUsername?.trim();
      let activeUser = detectedId || profile?.username?.trim();

      if (detectedId) {
        const detectedProfile: UsernameProfile = {
          username: detectedId,
          setAt: new Date().toISOString(),
        };
        setProfile(detectedProfile);
        activeUser = detectedId;
        try {
          localStorage.setItem("whofollows_username", JSON.stringify(detectedProfile));
        } catch {
          /* ignore */
        }
      }

      const cleanUser = activeUser?.toLowerCase();

      // STRICT ISOLATION: prior snapshot must STRICTLY belong to the same account username!
      // NEVER fall back to snapshots[0], which could belong to another account.
      const prior = cleanUser
        ? snapshots.find((s) => s.username?.trim().toLowerCase() === cleanUser) || null
        : null;

      setPreviousSnapshot(prior);
      setData(parsedData);
      setRelationships(rels);
      setSelectedSnapshotId(null);

      try {
        const followersMap: Record<string, typeof parsedData.followers[0]> = {};
        const followingMap: Record<string, typeof parsedData.following[0]> = {};
        for (const u of parsedData.followers) followersMap[u.username] = u;
        for (const u of parsedData.following) followingMap[u.username] = u;

        const dateStr = new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const newSnapshot: Omit<Snapshot, "id"> = {
          username: activeUser,
          date: new Date().toISOString(),
          label:
            customLabel ||
            (activeUser ? `@${activeUser} (${dateStr})` : `Export (${dateStr})`),
          followersMap,
          followingMap,
          pendingRequests: parsedData.pendingRequests || [],
          recentlyUnfollowed: parsedData.recentlyUnfollowed || [],
          closeFriends: parsedData.closeFriends || [],
          restrictedProfiles: parsedData.restrictedProfiles || [],
          stats: {
            followersCount: parsedData.followers.length,
            followingCount: parsedData.following.length,
            mutualsCount: rels.mutuals.length,
            dontFollowBackCount: rels.dontFollowBack.length,
            fansCount: rels.fans.length,
          },
        };

        const id = await saveSnapshot(newSnapshot);
        const saved = { ...newSnapshot, id };
        setCurrentSnapshot(saved);
        await refreshSnapshots();
      } catch (err) {
        console.warn("Failed to persist snapshot:", err);
      }
    },
    [profile, snapshots, refreshSnapshots]
  );


  const trustItems = [
    { icon: Lock, label: "Zero uploads", sub: "Data never leaves your device" },
    { icon: Database, label: "No sign-in needed", sub: "No account, no password" },
    { icon: Eye, label: "No trackers", sub: "No analytics, no ads" },
    { icon: ShieldCheck, label: "Open source", sub: "Inspect every line of code" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        snapshots={snapshots}
        selectedSnapshotId={selectedSnapshotId}
        currentSnapshotId={currentSnapshot?.id}
        onSelectSnapshot={handleSelectSnapshot}
        hasData={Boolean(data && relationships)}
        onReset={handleReset}
        currentProfile={profile}
        allAccounts={allAccounts}
        onSelectAccount={handleSelectAccount}
        onDeleteAccount={handleDeleteAccount}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {data && relationships ? (
          <Dashboard
            data={data}
            relationships={relationships}
            currentSnapshot={currentSnapshot}
            previousSnapshot={previousSnapshot}
            profile={profile}
            snapshots={snapshots}
            onSelectSnapshot={handleSelectSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            onDeleteSession={() => {
              if (profile?.username) {
                handleDeleteAccount(profile.username);
              } else {
                handleReset();
              }
            }}
          />
        ) : (
          <div className="max-w-xl mx-auto space-y-7 animate-in fade-in duration-300">
            {/* Privacy badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                <ShieldCheck className="w-3 h-3" />
                100% private · processed in your browser
              </div>
            </div>

            {/* Hero text */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Who stopped{" "}
                <span className="gradient-text">following you?</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Upload your official Instagram export to find out —
                no passwords, no server, no data shared.
              </p>
            </div>

            {/* Fast Switcher & Manager for saved accounts */}
            {allAccounts.length > 0 && (
              <div className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-500" />
                    Saved Accounts:
                  </span>
                  <span className="text-[11px] text-zinc-400">Click to switch or remove</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allAccounts.map((account) => (
                    <div
                      key={account}
                      className="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-xs group"
                    >
                      <button
                        onClick={() => handleSelectAccount(account)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                        title={`Open @${account} session`}
                      >
                        <span>@{account}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete saved session for @${account}? This will wipe its snapshots and local preferences.`)) {
                            handleDeleteAccount(account);
                          }
                        }}
                        className="px-2 py-1.5 text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-l border-zinc-100 dark:border-zinc-700/60 transition-colors cursor-pointer"
                        title={`Delete @${account} session`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Username chip */}
            <UsernameChip onProfileSet={setProfile} currentProfile={profile} />

            {/* Upload zone */}
            <DropZone onDataParsed={handleDataParsed} />

            {/* How-to guide */}
            <OnboardingGuide />

            {/* Trust grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {trustItems.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-100 dark:border-white/[0.05] bg-white/60 dark:bg-white/[0.015]"
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 mt-px shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-100 dark:border-white/[0.05] py-5 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Zero data leaves your browser · WhoFollowsMe · Not affiliated with Meta
        </span>
      </footer>
    </div>
  );
}
