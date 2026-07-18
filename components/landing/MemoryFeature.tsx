"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Icon from "@/components/Icon";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const noteItem: Variants = {
  hidden: { opacity: 0, x: 24, scale: 0.96 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};

type Note = {
  icon: "alert" | "check" | "spark";
  text: string;
  color: string;
};

const notes: Note[] = [
  {
    icon: "alert",
    text: "Gets defensive when compared to peers",
    color: "#0d0d0d",
  },
  {
    icon: "check",
    text: "Warms up to concrete evidence and numbers",
    color: "#0d0d0d",
  },
  {
    icon: "spark",
    text: "Opens up when you ask about their goals first",
    color: "#787878",
  },
];

export default function MemoryFeature() {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2 md:gap-12">
        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Your people
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            It learns your <span className="marker">actual</span> boss
          </h2>
          <p className="mt-4 text-muted">
            Save a real person from your life and the AI plays them, not a
            generic stand-in. It remembers how they argue, what sets them off,
            and what lands. Every session it gets more accurate — memory that
            compounds instead of resetting.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: "users", label: "Save the people who matter", color: "#0d0d0d" },
              { icon: "spark", label: "Sharper role-play each session", color: "#555555" },
              { icon: "shield", label: "Everything stays local to you", color: "#0d0d0d" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${row.color}20`, color: row.color }}
                >
                  <Icon name={row.icon as "users"} size={16} />
                </span>
                <span className="text-sm font-medium text-fg">{row.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <a
              href="#start"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-fg px-5 py-2.5 text-sm font-semibold"
            >
              Start practicing <Icon name="arrowRight" size={15} />
            </a>
          </div>
        </motion.div>

        {/* RIGHT — animated illustration */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="relative"
        >
          {/* ambient floating blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full blur-2xl"
            style={{ backgroundColor: "#0d0d0d33" }}
            animate={{ y: [0, -16, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full blur-2xl"
            style={{ backgroundColor: "#78787833" }}
            animate={{ y: [0, 14, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* person card */}
          <div className="relative rounded-3xl border border-border bg-surface p-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white"
                style={{ backgroundColor: "#0d0d0d" }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                DA
              </motion.div>
              <div>
                <div className="font-display text-lg font-extrabold tracking-tight">
                  Dana
                </div>
                <div className="text-sm text-muted">your manager</div>
              </div>
              <span
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#0d0d0d20", color: "#0d0d0d" }}
              >
                <Icon name="users" size={18} />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
              <Icon name="spark" size={14} />
              What the AI remembers
            </div>

            {/* memory note chips */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-3 space-y-3"
            >
              {notes.map((note) => (
                <motion.div
                  key={note.text}
                  variants={noteItem}
                  whileHover={{ y: -3 }}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${note.color}20`,
                      color: note.color,
                    }}
                  >
                    <Icon name={note.icon} size={15} />
                  </span>
                  <span className="text-sm font-medium text-fg">{note.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <span
                className="inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: "#0d0d0d" }}
              />
              Accuracy improves every session
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
