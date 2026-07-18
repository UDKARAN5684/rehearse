"use client";

import { motion, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

type UseCase = {
  icon: string;
  color: string;
  label: string;
  title: string;
  line: string;
};

const USE_CASES: UseCase[] = [
  {
    icon: "briefcase",
    color: "#0d0d0d",
    label: "At work",
    title: "Ask for the raise",
    line: "Rehearse the number out loud before you say it to a boss who pushes back.",
  },
  {
    icon: "home",
    color: "#0d0d0d",
    label: "At home",
    title: "Set the boundary",
    line: "That thing the roommate keeps doing — practice naming it without the flinch.",
  },
  {
    icon: "heart",
    color: "#0d0d0d",
    label: "Relationships",
    title: "Have the hard talk",
    line: "A breakup, an apology, a truth you've been circling. Say it here first.",
  },
  {
    icon: "users",
    color: "#787878",
    label: "Family",
    title: "Talk to your parents",
    line: "Load in the real person; the AI learns how they actually argue back.",
  },
  {
    icon: "receipt",
    color: "#555555",
    label: "Money",
    title: "Win the refund",
    line: "Negotiate the bill, chase the deposit, hold your line through the no.",
  },
  {
    icon: "target",
    color: "#0d0d0d",
    label: "Big decisions",
    title: "Pre-mortem the leap",
    line: "Quitting, moving, launching — let the AI walk you through how it fails.",
  },
];

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

export default function UseCases() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20">
      {/* ambient floating decorative blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d18" }}
        animate={{ y: [0, 26, 0], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d18" }}
        animate={{ y: [0, -30, 0], x: [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-4">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            The conversation you keep{" "}
            <span className="marker">putting off</span>
          </h2>
          <p className="mt-4 text-muted">
            If you&apos;ve rehearsed it in the shower, rehearse it here instead.
            Six kinds of moment where saying it once, safely, changes how it goes
            for real.
          </p>
        </motion.div>

        {/* grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {USE_CASES.map((uc) => (
            <motion.div
              key={uc.title}
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col rounded-3xl border border-border bg-surface p-6"
            >
              {/* colored icon chip */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `${uc.color}20`,
                    color: uc.color,
                  }}
                >
                  <Icon name={uc.icon} size={22} />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: uc.color }}
                >
                  {uc.label}
                </span>
              </div>

              <h3 className="mt-5 font-display text-lg font-extrabold tracking-tight">
                {uc.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{uc.line}</p>

              {/* animated underline accent on hover */}
              <motion.span
                aria-hidden
                className="mt-4 h-1 w-8 rounded-full"
                style={{ backgroundColor: uc.color }}
                initial={{ scaleX: 1 }}
                whileHover={{ scaleX: 1.6 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm text-muted">
            Don&apos;t see yours? Describe any situation in one sentence and drop
            straight in.
          </p>
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
