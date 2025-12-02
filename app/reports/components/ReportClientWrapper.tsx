"use client";

import dynamic from "next/dynamic";
import React from "react";

const ReportDashboard = dynamic(() => import("./ReportDashboard/index"), { ssr: false });

export default function ReportClientWrapper() {
  return <ReportDashboard />;
}
