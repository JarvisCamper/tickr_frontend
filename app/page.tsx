import Hero from "./components/Hero";
import React, { Suspense } from "react";
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Hero />
    </Suspense>
  );
}
