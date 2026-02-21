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
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  purple: "bg-purple-50 text-purple-700",
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
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
