"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Icon from "@/components/Icon";

const chipContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const chipItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 20 },
  },
};

const reassurances = [
  { label: "100% local & private", color: "#0d0d0d", icon: "shield" as const },
  { label: "3 free rehearsals a day", color: "#555555", icon: "spark" as const },
  { label: "No account needed", color: "#0d0d0d", icon: "check" as const },
];

export default function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="ink relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          {/* Ambient floating decorative shapes */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-2xl"
            style={{ backgroundColor: "#0d0d0d", opacity: 0.35 }}
            animate={{ y: [0, 24, 0], x: [0, 12, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full blur-2xl"
            style={{ backgroundColor: "#787878", opacity: 0.35 }}
            animate={{ y: [0, -28, 0], x: [0, -14, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-10 top-10 h-16 w-16 rounded-2xl"
            style={{ backgroundColor: "#555555", opacity: 0.9 }}
            animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-12 left-12 h-10 w-10 rounded-full border-2"
            style={{ borderColor: "#0d0d0d" }}
            animate={{ y: [0, 14, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: "#0d0d0d20", color: "#0d0d0d" }}
            >
              <Icon name="spark" size={14} />
              Your turn
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.16, type: "spring", stiffness: 190, damping: 22 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
            >
              Say it here first.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.22, type: "spring", stiffness: 190, damping: 22 }}
              className="mx-auto mt-5 max-w-xl text-base opacity-80 sm:text-lg"
            >
              Rehearse the conversation you have been dreading, pressure-test the
              decision you cannot unmake, and walk in already knowing what to say.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
              className="mt-9"
            >
              <motion.a
                href="#start"
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
                style={{ backgroundColor: "#FFFFFF", color: "#0d0d0d" }}
              >
                Start a rehearsal
                <Icon name="arrowRight" size={18} />
              </motion.a>
            </motion.div>

            <motion.div
              variants={chipContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {reassurances.map((r) => (
                <motion.span
                  key={r.label}
                  variants={chipItem}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: `${r.color}1F`, color: r.color }}
                >
                  <Icon name={r.icon} size={15} />
                  {r.label}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
