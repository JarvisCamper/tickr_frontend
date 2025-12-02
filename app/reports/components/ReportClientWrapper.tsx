"use client";

import dynamic from "next/dynamic";
import React from "react";

const ReportDashboard = dynamic(() => import("./ReportDashboard"), { ssr: false });
console.log("hi")

export default function ReportClientWrapper() {
  return <ReportDashboard />;
}
