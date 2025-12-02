"use client";

import dynamic from "next/dynamic";
import React from "react";

const ReportDashboard = dynamic(() => import("./components/ReportDashboard"), { ssr: false });

export default function ReportClientWrapper() {
  return <ReportDashboard />;
}
