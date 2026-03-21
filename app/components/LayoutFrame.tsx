"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function LayoutFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute ? <Navbar /> : null}
      <main className={isAdminRoute ? "min-h-screen" : "min-h-screen pt-28 pb-12"}>
        {children}
      </main>
      {!isAdminRoute ? <Footer /> : null}
    </>
  );
}
