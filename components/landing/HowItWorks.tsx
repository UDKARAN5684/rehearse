"use client";

import { motion, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};

type Step = {
  n: string;
  icon: "target" | "chat" | "check";
  title: string;
  line: string;
  color: string;
};

const steps: Step[] = [
  {
    n: "01",
    icon: "target",
    title: "Pick a scenario",
    line: "Choose from 6 built-in tough conversations — or describe your own in a sentence and drop straight in.",
    color: "#0d0d0d",
  },
  {
    n: "02",
    icon: "chat",
    title: "Talk it out",
    line: "The AI role-plays the other person realistically and pushes back — replies stream live, no waiting.",
    color: "#0d0d0d",
  },
  {
    n: "03",
    icon: "check",
    title: "Get your report",
    line: "A candid 0–100 score, what worked, what hurt you, and better lines to try next time.",
    color: "#0d0d0d",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative w-full scroll-mt-20 overflow-hidden py-16 sm:py-20">
      {/* ambient floating decorative shapes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: "#7878781f" }}
        animate={{ y: [0, 28, 0], x: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "#5555551f" }}
        animate={{ y: [0, -24, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-4">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            How it works
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            From nervous to <span className="marker">rehearsed</span> in three steps
          </h2>
          <p className="mt-4 text-muted">
            No setup, no account. Pick a moment you&rsquo;re dreading, practice it out loud,
            and walk away knowing exactly what to say.
          </p>
        </motion.div>

        {/* steps */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {steps.map((s) => (
            <motion.div
              key={s.n}
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-card"
            >
              {/* faint big number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-3 select-none font-display text-7xl font-extrabold leading-none"
                style={{ color: s.color, opacity: 0.1 }}
              >
                {s.n}
              </span>

              {/* top accent bar */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: s.color }}
              />

              <div className="relative flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${s.color}20`, color: s.color }}
                >
                  <Icon name={s.icon} size={22} />
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: s.color }}
                >
                  Step {s.n}
                </span>
              </div>

              <h3 className="relative mt-5 font-display text-xl font-extrabold tracking-tight">
                {s.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">
                {s.line}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 text-center"
        >
          <a
            href="#start"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-fg shadow-glow-sm px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            Start practicing <Icon name="arrowRight" size={15} />
          </a>
          <span className="text-xs text-muted">
            3 free sessions a day &middot; runs on open models &middot; 100% private, stored in your browser
          </span>
        </motion.div>
      </div>
    </section>
  );
}
