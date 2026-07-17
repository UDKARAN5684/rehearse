"use client";
// Bespoke Rehearse logomark — a live voice waveform (speaking / rehearsing out
// loud). Bars gently animate; one carries the coral accent. No emoji.
import { motion } from "framer-motion";

export function LogoMark({ className = "" }: { className?: string }) {
  const accent = "rgb(var(--accent))";
  const bars = [
    { x: 2.2, h: 13, fill: "currentColor" },
    { x: 8.2, h: 26, fill: accent },
    { x: 14.2, h: 10, fill: "currentColor" },
    { x: 20.2, h: 20, fill: "currentColor" },
    { x: 26.2, h: 8, fill: "currentColor" },
  ];
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      {bars.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x}
          y={(32 - b.h) / 2}
          width="3.6"
          height={b.h}
          rx="1.8"
          style={{
            fill: b.fill,
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
          initial={{ scaleY: 0.6 }}
          animate={{ scaleY: [0.55, 1, 0.7, 0.95, 0.55] }}
          transition={{
            duration: 1.8 + i * 0.16,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-6 w-6 text-fg" />
      <span className="font-display text-[19px] font-extrabold tracking-tight text-fg">
        Rehearse
      </span>
    </span>
  );
}
