"use client";

import { Users, UserCheck, Heart, UserX } from "lucide-react";

interface KpiCardsProps {
  followersCount: number;
  followingCount: number;
  mutualsCount: number;
  dontFollowBackCount: number;
}

export default function KpiCards({
  followersCount,
  followingCount,
  mutualsCount,
  dontFollowBackCount,
}: KpiCardsProps) {
  const mutualRatio = followingCount > 0 ? Math.round((mutualsCount / followingCount) * 100) : 0;
  const unreciprocatedRatio = followingCount > 0 ? Math.round((dontFollowBackCount / followingCount) * 100) : 0;

  const stats = [
    {
      label: "Followers",
      value: followersCount,
      icon: Users,
      sub: "in your network",
      color: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: "Following",
      value: followingCount,
      icon: UserCheck,
      sub: "accounts followed",
      color: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: "Mutuals",
      value: mutualsCount,
      icon: Heart,
      sub: `${mutualRatio}% follow back`,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Not Following Back",
      value: dontFollowBackCount,
      icon: UserX,
      sub: `${unreciprocatedRatio}% unreciprocated`,
      color: "text-rose-500 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200/60 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-white/[0.06]">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`bg-white dark:bg-zinc-950/80 px-4 py-4 sm:px-5 sm:py-5 ${
              i < 2 ? "sm:border-r-0" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                {stat.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {stat.value.toLocaleString()}
            </div>
            <div className={`mt-1 text-[11px] font-medium ${stat.color}`}>
              {stat.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
