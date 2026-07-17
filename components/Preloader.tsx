"use client";
// Site-entry curtain: a near-black panel with the wordmark that lifts away like
// a curtain once the page is ready, revealing the content beneath.
import { useEffect, useState } from "react";

export default function Preloader() {
  const [lift, setLift] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLift(true), 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100000] flex items-center justify-center"
      style={{
        transform: lift ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 1.4s cubic-bezier(.87,0,.13,1) .2s",
      }}
    >
      <div className="absolute inset-0 bg-[#0d0d0d]" />
      <span
        className="relative font-display text-3xl font-medium tracking-tight text-white transition-opacity duration-500"
        style={{ opacity: lift ? 0 : 1 }}
      >
        Rehearse
      </span>
    </div>
  );
}
