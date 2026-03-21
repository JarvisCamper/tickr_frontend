"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  tone?: "blue" | "amber" | "green" | "purple";
}

const toneClasses: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  blue: "bg-linear-to-br from-cyan-50 to-sky-100 text-cyan-700",
  amber: "bg-linear-to-br from-amber-50 to-orange-100 text-amber-700",
  green: "bg-linear-to-br from-emerald-50 to-teal-100 text-emerald-700",
  purple: "bg-linear-to-br from-violet-50 to-indigo-100 text-violet-700",
};

export function StatsCard({
  icon,
  label,
  value,
  change,
  trend,
  tone = "blue",
}: StatsCardProps) {
  return (
    <div className="admin-panel rounded-[1.7rem] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {change && (
            <p className={`mt-3 text-sm font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
