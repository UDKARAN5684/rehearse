"use client";

import { motion } from "framer-motion";
import Icon from "@/components/Icon";

type Pill = {
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Icon>["name"];
};

const COLORS = {
  coral: "#0d0d0d",
  yellow: "#555555",
  blue: "#0d0d0d",
  green: "#0d0d0d",
  purple: "#787878",
} as const;

const PILLS: Pill[] = [
  { label: "Ask for a raise", color: COLORS.green, icon: "spark" },
  { label: "Set a boundary", color: COLORS.blue, icon: "shield" },
  { label: "Give hard feedback", color: COLORS.coral, icon: "message" },
  { label: "End a relationship", color: COLORS.purple, icon: "heart" },
  { label: "Demand a refund", color: COLORS.yellow, icon: "receipt" },
  { label: "Quit your job", color: COLORS.blue, icon: "briefcase" },
  { label: "Confront a friend", color: COLORS.coral, icon: "users" },
  { label: "Say no", color: COLORS.green, icon: "x" },
  { label: "Negotiate rent", color: COLORS.purple, icon: "home" },
  { label: "Break bad news", color: COLORS.yellow, icon: "alert" },
  { label: "Ask for the sale", color: COLORS.coral, icon: "target" },
  { label: "Push back on your boss", color: COLORS.blue, icon: "chat" },
  { label: "Repair a rift", color: COLORS.green, icon: "heart" },
  { label: "Turn down a project", color: COLORS.purple, icon: "crosshair" },
];

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
    >
      {PILLS.map((pill, i) => (
        <div
          key={`${pill.label}-${i}`}
          className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold sm:px-5 sm:py-2.5"
          style={{
            backgroundColor: `${pill.color}14`,
            borderColor: `${pill.color}40`,
            color: pill.color,
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: `${pill.color}26` }}
          >
            <Icon name={pill.icon} size={14} />
          </span>
          <span className="whitespace-nowrap">{pill.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="w-full overflow-hidden py-8 sm:py-10">
      <div className="mx-auto mb-6 w-full max-w-4xl px-4">
        <div className="flex items-center justify-center gap-2">
          <motion.span
            className="text-accent"
            animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="spark" size={16} />
          </motion.span>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Rehearse any conversation
          </p>
        </div>
      </div>

      <div className="relative">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent sm:w-28" />

        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <Track />
          <Track ariaHidden />
        </motion.div>
      </div>

      {/* second row, reverse direction, offset colors */}
      <div className="relative mt-3 sm:mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent sm:w-28" />

        <motion.div
          className="flex w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          <Track />
          <Track ariaHidden />
        </motion.div>
      </div>
    </section>
  );
}
