"use client";

import { motion, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

const benefits = [
  {
    icon: "heart",
    color: "#0d0d0d",
    title: "No judgment",
    line: "Fumble, restart, say the wrong thing. The AI never flinches.",
  },
  {
    icon: "chat",
    color: "#0d0d0d",
    title: "Real pushback",
    line: "It role-plays realistically and actually argues back at you.",
  },
  {
    icon: "spark",
    color: "#555555",
    title: "Practice anytime",
    line: "Rehearse the hard talk at 2am. Three free rounds every day.",
  },
  {
    icon: "target",
    color: "#0d0d0d",
    title: "Actionable feedback",
    line: "A 0-100 score, better lines to try, one thing to change next.",
  },
  {
    icon: "users",
    color: "#787878",
    title: "Your real people",
    line: "Save a person and the AI learns them, session over session.",
  },
  {
    icon: "shield",
    color: "#0d0d0d",
    title: "Private & local",
    line: "Everything stays in your browser. No account, no cloud, no leaks.",
  },
] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};

export default function Benefits() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* ambient floating blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d22" }}
        animate={{ y: [0, 26, 0], x: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "#55555522" }}
        animate={{ y: [0, -22, 0], x: [0, -12, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Why it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you need to walk in{" "}
            <span className="marker">ready</span>.
          </h2>
          <p className="mt-3 text-muted">
            A safe room to say it wrong, hear it pushed back, and fix it before
            it counts.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {benefits.map((b) => (
            <motion.div
              key={b.title}
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-3xl border border-border bg-surface p-5"
            >
              <span
                className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${b.color}20`, color: b.color }}
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Icon name={b.icon} size={22} />
              </motion.div>
              <h3 className="mt-4 font-display text-base font-extrabold tracking-tight">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm leading-snug text-muted">{b.line}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mt-10 flex justify-center"
        >
          <a
            href="#start"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-fg px-5 py-2.5 text-sm font-semibold"
          >
            Start practicing <Icon name="arrowRight" size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
