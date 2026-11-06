"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KpiCards from "./KpiCards";
import TabBar from "./TabBar";
import UserTable from "./UserTable";
import SnapshotDiffView from "./SnapshotDiffView";
import TimelineView from "./TimelineView";
import CloseFriendsAudit from "./CloseFriendsAudit";
import RecentlyUnfollowed from "./RecentlyUnfollowed";
import { useWhitelist, useVisited } from "@/hooks/useLocalStorage";
import type { InstagramData, RelationshipSets, Snapshot, TabDef, InstagramUser } from "@/lib/types";
import type { UsernameProfile } from "./UsernameChip";
import ProfileDataView from "./ProfileDataView";
import { diffSnapshots } from "@/lib/storage";
import { Sparkles, Eye, ArrowRight } from "lucide-react";

interface DashboardProps {
  data: InstagramData;
  relationships: RelationshipSets;
  currentSnapshot?: Snapshot;
  previousSnapshot?: Snapshot | null;
  profile?: UsernameProfile | null;
  snapshots?: Snapshot[];
  onSelectSnapshot?: (id: number) => void;
  onDeleteSnapshot?: (id: number) => void;
  onDeleteSession?: () => void;
}

export default function Dashboard({
  data,
  relationships,
  currentSnapshot,
  previousSnapshot,
  profile,
  snapshots,
  onSelectSnapshot,
  onDeleteSnapshot,
  onDeleteSession,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("dont-follow-back");
  const { whitelistSet, toggle: toggleWhitelist, bulkAdd: bulkWhitelist } = useWhitelist(profile?.username);
  const { visitedSet, markVisited, resetAll: resetVisited } = useVisited(profile?.username);

  // Compute Unseen Changes compared to previous saved snapshot for this user
  const effectiveSnapshot: Snapshot = useMemo(() => {
    if (currentSnapshot) return currentSnapshot;
    const followersMap: Record<string, InstagramUser> = {};
    const followingMap: Record<string, InstagramUser> = {};
    for (const u of data.followers) followersMap[u.username] = u;
    for (const u of data.following) followingMap[u.username] = u;

    return {
      date: new Date().toISOString(),
      label: "Current Upload",
      followersMap,
      followingMap,
      stats: {
        followersCount: data.followers.length,
        followingCount: data.following.length,
        mutualsCount: relationships.mutuals.length,
        dontFollowBackCount: relationships.dontFollowBack.length,
        fansCount: relationships.fans.length,
      },
    };
  }, [currentSnapshot, data, relationships]);

  const unseenDiff = useMemo(() => {
    if (!previousSnapshot || !effectiveSnapshot) return null;
    return diffSnapshots(previousSnapshot, effectiveSnapshot);
  }, [previousSnapshot, effectiveSnapshot]);

  const totalUnseenCount = useMemo(() => {
    if (!unseenDiff) return 0;
    return (
      unseenDiff.lostFollowers.length +
      unseenDiff.newFollowers.length +
      unseenDiff.newFollowing.length
    );
  }, [unseenDiff]);

  // Default to showing unseen changes first if changes exist!
  const [showUnseenOnly, setShowUnseenOnly] = useState<boolean>(totalUnseenCount > 0);

  // Filter whitelisted users for the whitelisted tab
  const whitelistedUsers = useMemo(() => {
    const allUsersMap = new Map<string, InstagramUser>();
    for (const u of data.following) allUsersMap.set(u.username, u);
    for (const u of data.followers) {
      if (!allUsersMap.has(u.username)) allUsersMap.set(u.username, u);
    }

    const result: InstagramUser[] = [];
    for (const username of whitelistSet) {
      const existing = allUsersMap.get(username);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          username,
          href: `https://www.instagram.com/${username}`,
          timestamp: 0,
        });
      }
    }
    return result;
  }, [data, whitelistSet]);

  // Check if any close friends don't follow back
  const followersLower = useMemo(
    () => new Set(data.followers.map((u) => u.username.toLowerCase())),
    [data.followers]
  );
  const hasCloseFriendsWarning = useMemo(() => {
    return data.closeFriends.some((u) => !followersLower.has(u.username.toLowerCase()));
  }, [data.closeFriends, followersLower]);

  // Active unreciprocated count excluding whitelisted
  const activeDontFollowBackCount = useMemo(() => {
    return relationships.dontFollowBack.filter((u) => !whitelistSet.has(u.username)).length;
  }, [relationships.dontFollowBack, whitelistSet]);

  // Tab definitions
  const tabs: TabDef[] = useMemo(
    () => [
      {
        id: "dont-follow-back",
        label: "Don't Follow Back",
        count: activeDontFollowBackCount,
        iconName: "UserX",
      },
      {
        id: "mutuals",
        label: "Mutuals",
        count: relationships.mutuals.length,
        iconName: "Heart",
      },
      {
        id: "fans",
        label: "Fans",
        count: relationships.fans.length,
        iconName: "Users",
      },
      {
        id: "pending",
        label: "Pending Requests",
        count: data.pendingRequests.length,
        iconName: "Clock",
      },
      {
        id: "changes",
        label: "Changes & Diff",
        count: totalUnseenCount,
        iconName: "History",
      },
      {
        id: "timeline",
        label: "Timeline & Day 1s",
        count: 0,
        iconName: "Calendar",
      },
      {
        id: "close-friends",
        label: "Close Friends Audit",
        count: data.closeFriends.length,
        iconName: "Star",
        warning: hasCloseFriendsWarning,
      },
      {
        id: "recently-unfollowed",
        label: "Recently Unfollowed",
        count: data.recentlyUnfollowed.length,
        iconName: "UserMinus",
      },
      {
        id: "whitelisted",
        label: "Whitelisted",
        count: whitelistSet.size,
        iconName: "ShieldCheck",
      },
      {
        id: "my-profile",
        label: profile ? `@${profile.username}` : "My Profile & Data",
        count: 0,
        iconName: "User",
      },
    ],
    [
      activeDontFollowBackCount,
      relationships.mutuals.length,
      relationships.fans.length,
      data.pendingRequests.length,
      data.closeFriends.length,
      data.recentlyUnfollowed.length,
      whitelistSet.size,
      hasCloseFriendsWarning,
      totalUnseenCount,
      profile,
    ]
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Returning User: Unseen Data First Banner */}
      {unseenDiff && totalUnseenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Welcome back {profile?.username ? `@${profile.username}` : ""}! We found {totalUnseenCount} unseen updates
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Compared to your previous upload ({new Date(previousSnapshot!.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}):
              {" "}<strong>{unseenDiff.lostFollowers.length}</strong> unfollowers, <strong>{unseenDiff.newFollowers.length}</strong> new followers, <strong>{unseenDiff.newFollowing.length}</strong> newly followed.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showUnseenOnly ? (
              <button
                onClick={() => setShowUnseenOnly(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-xs cursor-pointer"
              >
                <span>Show All Data ({data.followers.length} Followers)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowUnseenOnly(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-100/70 dark:bg-violet-950/60 hover:bg-violet-200/70 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Unseen Only</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* VIEW MODE A: Show Unseen Data First */}
      {showUnseenOnly && unseenDiff ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Unseen Updates & Recent Changes
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing only newly detected changes since your last saved snapshot
              </p>
            </div>

            <button
              onClick={() => setShowUnseenOnly(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <span>View Full Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lost Followers (Unfollowers) Table */}
          {unseenDiff.lostFollowers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Who Unfollowed You ({unseenDiff.lostFollowers.length})
                </span>
              </div>
              <UserTable
                tabLabel="Unseen Unfollowers"
                users={unseenDiff.lostFollowers}
                whitelistSet={whitelistSet}
                visitedSet={visitedSet}
                onToggleWhitelist={toggleWhitelist}
                onMarkVisited={markVisited}
                onBulkWhitelist={bulkWhitelist}
                onResetVisited={resetVisited}
                showWhitelist={true}
                badgeGetter={() => ({
                  label: "Recently Unfollowed You",
                  color: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40",
                })}
              />
            </div>
          )}

          {/* New Followers Table */}
          {unseenDiff.newFollowers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  New Followers ({unseenDiff.newFollowers.length})
                </span>
              </div>
              <UserTable
                tabLabel="Unseen New Followers"
                users={unseenDiff.newFollowers}
                whitelistSet={whitelistSet}
                visitedSet={visitedSet}
                onToggleWhitelist={toggleWhitelist}
                onMarkVisited={markVisited}
                onBulkWhitelist={bulkWhitelist}
                onResetVisited={resetVisited}
                showWhitelist={true}
                badgeGetter={() => ({
                  label: "New Follower",
                  color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40",
                })}
              />
            </div>
          )}

          {/* New Following */}
          {unseenDiff.newFollowing.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Accounts You Recently Followed ({unseenDiff.newFollowing.length})
                </span>
              </div>
              <UserTable
                tabLabel="Unseen New Following"
                users={unseenDiff.newFollowing}
                whitelistSet={whitelistSet}
                visitedSet={visitedSet}
                onToggleWhitelist={toggleWhitelist}
                onMarkVisited={markVisited}
                onBulkWhitelist={bulkWhitelist}
                onResetVisited={resetVisited}
                showWhitelist={true}
                badgeGetter={() => ({
                  label: "New Following",
                  color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40",
                })}
              />
            </div>
          )}

          {/* Request Button to reveal full dashboard */}
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowUnseenOnly(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-sm transition-all cursor-pointer"
            >
              <span>View Full Account Analysis ({data.followers.length} Followers · {data.following.length} Following)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE B: Full Dashboard */
        <>
          {/* Active Account Session Header */}
          {profile?.username && (
            <div className="flex items-center justify-between pb-1 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Account:
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-900/40">
                  @{profile.username}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                100% In-Browser Session
              </span>
            </div>
          )}

          {/* KPI Stat Cards */}
          <KpiCards
            followersCount={data.followers.length}
            followingCount={data.following.length}
            mutualsCount={relationships.mutuals.length}
            dontFollowBackCount={relationships.dontFollowBack.length}
          />

          {/* Segmented Tab Navigation */}
          <div className="space-y-4">
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content Panes */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "dont-follow-back" && (
                  <motion.div
                    key="tab-dont-follow-back"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UserTable
                      tabLabel="Don't Follow Back"
                      users={relationships.dontFollowBack}
                      whitelistSet={whitelistSet}
                      visitedSet={visitedSet}
                      onToggleWhitelist={toggleWhitelist}
                      onMarkVisited={markVisited}
                      onBulkWhitelist={bulkWhitelist}
                      onResetVisited={resetVisited}
                      showWhitelist={true}
                      hideWhitelisted={true}
                      badgeGetter={() => ({
                        label: "Doesn't Follow Back",
                        color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40",
                      })}
                    />
                  </motion.div>
                )}

                {activeTab === "mutuals" && (
                  <motion.div
                    key="tab-mutuals"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UserTable
                      tabLabel="Mutuals"
                      users={relationships.mutuals}
                      whitelistSet={whitelistSet}
                      visitedSet={visitedSet}
                      onToggleWhitelist={toggleWhitelist}
                      onMarkVisited={markVisited}
                      onBulkWhitelist={bulkWhitelist}
                      onResetVisited={resetVisited}
                      showWhitelist={true}
                      badgeGetter={() => ({
                        label: "Mutual Follower",
                        color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40",
                      })}
                    />
                  </motion.div>
                )}

                {activeTab === "fans" && (
                  <motion.div
                    key="tab-fans"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UserTable
                      tabLabel="Fans"
                      users={relationships.fans}
                      whitelistSet={whitelistSet}
                      visitedSet={visitedSet}
                      onToggleWhitelist={toggleWhitelist}
                      onMarkVisited={markVisited}
                      onBulkWhitelist={bulkWhitelist}
                      onResetVisited={resetVisited}
                      showWhitelist={true}
                      badgeGetter={() => ({
                        label: "Follows You",
                        color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40",
                      })}
                    />
                  </motion.div>
                )}

                {activeTab === "pending" && (
                  <motion.div
                    key="tab-pending"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UserTable
                      tabLabel="Pending Requests"
                      users={data.pendingRequests}
                      whitelistSet={whitelistSet}
                      visitedSet={visitedSet}
                      onToggleWhitelist={toggleWhitelist}
                      onMarkVisited={markVisited}
                      onBulkWhitelist={bulkWhitelist}
                      onResetVisited={resetVisited}
                      showWhitelist={false}
                      badgeGetter={() => ({
                        label: "Request Sent",
                        color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40",
                      })}
                    />
                  </motion.div>
                )}

                {activeTab === "changes" && (
                  <motion.div
                    key="tab-changes"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SnapshotDiffView currentSnapshot={effectiveSnapshot} />
                  </motion.div>
                )}

                {activeTab === "timeline" && (
                  <motion.div
                    key="tab-timeline"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TimelineView
                      followers={data.followers}
                      dontFollowBack={relationships.dontFollowBack}
                    />
                  </motion.div>
                )}

                {activeTab === "close-friends" && (
                  <motion.div
                    key="tab-close-friends"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CloseFriendsAudit
                      closeFriends={data.closeFriends}
                      restrictedProfiles={data.restrictedProfiles}
                      followers={data.followers}
                      following={data.following}
                    />
                  </motion.div>
                )}

                {activeTab === "recently-unfollowed" && (
                  <motion.div
                    key="tab-recently-unfollowed"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RecentlyUnfollowed
                      users={data.recentlyUnfollowed}
                      visitedUsers={visitedSet}
                      onToggleVisited={markVisited}
                    />
                  </motion.div>
                )}

                {activeTab === "whitelisted" && (
                  <motion.div
                    key="tab-whitelisted"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UserTable
                      tabLabel="Whitelisted Accounts"
                      users={whitelistedUsers}
                      whitelistSet={whitelistSet}
                      visitedSet={visitedSet}
                      onToggleWhitelist={toggleWhitelist}
                      onMarkVisited={markVisited}
                      onBulkWhitelist={bulkWhitelist}
                      onResetVisited={resetVisited}
                      showWhitelist={true}
                      badgeGetter={() => ({
                        label: "Whitelisted",
                        color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40",
                      })}
                    />
                  </motion.div>
                )}

                {activeTab === "my-profile" && (
                  <motion.div
                    key="tab-my-profile"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ProfileDataView
                      data={data}
                      relationships={relationships}
                      profile={profile ?? null}
                      snapshots={snapshots}
                      currentSnapshotId={currentSnapshot?.id}
                      onSelectSnapshot={onSelectSnapshot}
                      onDeleteSnapshot={onDeleteSnapshot}
                      onDeleteSession={onDeleteSession}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
