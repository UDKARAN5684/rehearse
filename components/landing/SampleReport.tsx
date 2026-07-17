"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

const FINAL_SCORE = 82;
const RING_SIZE = 168;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
};

function ScoreRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ringRef, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * FINAL_SCORE));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const dashOffset = RING_CIRC * (1 - (inView ? FINAL_SCORE / 100 : 0));

  return (
    <div ref={ringRef} className="relative flex items-center justify-center">
      {/* soft glow behind ring */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, #0d0d0d33, transparent 70%)" }}
        aria-hidden
      />
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="relative -rotate-90"
        role="img"
        aria-label={`Score ${FINAL_SCORE} out of 100`}
      >
        <defs>
          <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#555555" />
            <stop offset="55%" stopColor="#0d0d0d" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE}
          className="text-border"
          opacity={0.5}
        />
        {/* progress */}
        <motion.circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="url(#scoreRingGrad)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          initial={{ strokeDashoffset: RING_CIRC }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-extrabold tracking-tight text-fg tabular-nums">
          {count}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted">/ 100</span>
      </div>
    </div>
  );
}

export default function SampleReport() {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-4xl px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent">The payoff</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            Here is what you get
          </h2>
          <p className="mt-3 text-muted">
            Finish a session and Rehearse hands you a graded report card &mdash; a score, the lines that
            landed, and the exact words to try <span className="marker">next time</span>.
          </p>
        </motion.div>

        {/* Report card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 190, damping: 24 }}
          className="relative mt-10 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8"
        >
          {/* ambient floating blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: "#78787833" }}
            animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full blur-3xl"
            style={{ backgroundColor: "#5555552e" }}
            animate={{ y: [0, -14, 0], x: [0, 12, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative grid grid-cols-1 items-center gap-8 sm:grid-cols-[auto_1fr]">
            {/* Ring column */}
            <div className="flex flex-col items-center gap-4">
              <ScoreRing />
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: "#0d0d0d1f", color: "#0d0d0d" }}
              >
                <Icon name="spark" size={13} />
                Strong session
              </span>
            </div>

            {/* Headline + meta */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: "#0d0d0d1a", color: "#0d0d0d" }}
              >
                <Icon name="spark" size={14} />
                Your report card
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-fg sm:text-3xl">
                You stayed calm under pressure
              </h3>
              <p className="mt-2 text-muted">
                You held your ground without escalating &mdash; but you gave up leverage the moment you
                apologized first. Here is the breakdown.
              </p>
            </div>
          </div>

          {/* Feedback rows */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="relative mt-8 grid grid-cols-1 gap-4"
          >
            {/* Try instead */}
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl bg-accent-soft p-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full"
                  style={{ backgroundColor: "#0d0d0d", color: "#fff" }}
                >
                  <Icon name="pencil" size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-accent">Try instead</span>
              </div>
              <p className="mt-3 text-sm text-muted line-through decoration-accent/50">
                &ldquo;Sorry to bring this up again, but I was kind of hoping we could maybe look at my
                comp?&rdquo;
              </p>
              <p className="mt-2 font-display text-lg font-extrabold tracking-tight text-fg">
                &ldquo;I&rsquo;ve taken on the analytics roadmap since my last review. I&rsquo;d like to
                align my salary to that scope &mdash; can we walk through the numbers?&rdquo;
              </p>
            </motion.div>

            {/* What worked */}
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-border bg-surface-2 p-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full"
                  style={{ backgroundColor: "#0d0d0d", color: "#fff" }}
                >
                  <Icon name="check" size={16} />
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#0d0d0d" }}
                >
                  What worked
                </span>
              </div>
              <p className="mt-3 text-fg">
                You paused before answering the pushback instead of filling the silence &mdash; that
                held your composure and made your ask land as a decision, not a plea.
              </p>
            </motion.div>

            {/* One thing to change */}
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="ink flex items-start gap-3 rounded-2xl p-5"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: "#555555", color: "#111" }}
              >
                <Icon name="target" size={16} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#555555" }}>
                  Change one thing next time
                </p>
                <p className="mt-1 font-display text-lg font-extrabold tracking-tight">
                  State your number first. Let them react to it &mdash; don&rsquo;t negotiate against
                  yourself.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
            className="relative mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <p className="text-sm text-muted">
              Every session ends with a card like this. Free, 3 times a day.
            </p>
            <a
              href="#start"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-fg shadow-glow-sm px-5 py-2.5 text-sm font-semibold"
            >
              Start practicing <Icon name="arrowRight" size={15} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
