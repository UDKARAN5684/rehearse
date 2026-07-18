"use client";

import { motion, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

const bulletList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const bulletItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

type Mode = {
  eyebrow: string;
  title: string;
  icon: "chat" | "target";
  color: string;
  description: string;
  bullets: string[];
  cta: string;
};

const modes: Mode[] = [
  {
    eyebrow: "Mode 01",
    title: "Conversation Simulator",
    icon: "chat",
    color: "#0d0d0d",
    description:
      "An AI role-plays the other person realistically and pushes back the way they actually would. When you’re done, you get a graded report that shows exactly where the conversation turned.",
    bullets: [
      "Scores your run 0–100 with what worked and what hurt you",
      "Hands you sharper lines to try in the moment",
      "Plays the real people in your life, more accurately each session",
    ],
    cta: "Run a conversation",
  },
  {
    eyebrow: "Mode 02",
    title: "Pre-Mortem",
    icon: "target",
    color: "#0d0d0d",
    description:
      "Imagine your big decision has already failed, then let the AI interview you through the wreckage. It walks you backward from the failure to the choices that caused it.",
    bullets: [
      "Builds a ranked risk map of what’s most likely to sink you",
      "Pairs every risk with a concrete inoculation",
      "Turns a vague gut feeling into a decision you can defend",
    ],
    cta: "Pressure-test a decision",
  },
];

export default function TwoModes() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20">
      {/* ambient floating decorative shapes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d22" }}
        animate={{ y: [0, 24, 0], x: [0, 12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d22" }}
        animate={{ y: [0, -28, 0], x: [0, -14, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-4">
        {/* header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Two ways to rehearse
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Practice the moment, or{" "}
            <span className="marker">stress-test the call</span>
          </h2>
          <p className="mt-4 text-muted">
            Rehearse works two ways: live-fire the hard conversation before it
            happens, or walk your biggest decision through its own failure
            first. Pick a mode and drop straight in.
          </p>
        </motion.div>

        {/* cards */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.title}
              variants={item}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.985 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-7"
            >
              {/* colored background wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background: `radial-gradient(120% 90% at 0% 0%, ${mode.color}18 0%, transparent 55%)`,
                }}
              />
              {/* floating corner blob */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                style={{ backgroundColor: `${mode.color}30` }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative">
                {/* icon chip + eyebrow */}
                <div className="flex items-center gap-3">
                  <motion.span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `${mode.color}20`,
                      color: mode.color,
                    }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon name={mode.icon} size={24} />
                  </motion.span>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: mode.color }}
                  >
                    {mode.eyebrow}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                  {mode.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {mode.description}
                </p>

                {/* bullets */}
                <motion.ul
                  className="mt-6 space-y-3"
                  variants={bulletList}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                >
                  {mode.bullets.map((b) => (
                    <motion.li
                      key={b}
                      variants={bulletItem}
                      className="flex items-start gap-3 text-sm text-fg"
                    >
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${mode.color}22`,
                          color: mode.color,
                        }}
                      >
                        <Icon name="check" size={13} />
                      </span>
                      <span className="text-muted">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* CTA */}
                <div className="mt-7">
                  <a
                    href="#start"
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-fg px-5 py-2.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
                  >
                    {mode.cta}
                    <Icon name="arrowRight" size={15} />
                  </a>
                </div>
              </div>

              {/* bottom accent bar */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
                style={{ backgroundColor: mode.color }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
