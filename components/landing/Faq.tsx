"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Icon from "@/components/Icon";

type Faq = {
  q: string;
  a: string;
  icon: "shield" | "spark" | "users" | "heart" | "pencil";
  color: string;
};

const FAQS: Faq[] = [
  {
    q: "Is my conversation private?",
    a: "Completely. Everything you type stays on your device — it's stored locally in your browser, never on a server. There's no account to create and no sign-up. Clear your browser data and it's gone for good.",
    icon: "shield",
    color: "#0d0d0d",
  },
  {
    q: "What AI does it use?",
    a: "Rehearse runs on open-source Llama models served through Groq, so replies stream back to you live, word by word — no long waits staring at a spinner while the other side “thinks.”",
    icon: "spark",
    color: "#0d0d0d",
  },
  {
    q: "Can it play someone I actually know?",
    a: "Yes. Save a real person from your life and the AI learns how they talk, what they care about, and how they push back. The more you rehearse with them, the more accurate the role-play gets.",
    icon: "users",
    color: "#787878",
  },
  {
    q: "Is it free?",
    a: "Yes — you get a few free practice sessions every day, no card required. Come back tomorrow and your free sessions refresh. It's built so you can actually make rehearsing a habit.",
    icon: "heart",
    color: "#0d0d0d",
  },
  {
    q: "Can I practice my own situation?",
    a: "Absolutely. Beyond the built-in scenarios, you can describe any situation in a single sentence and drop straight into a custom role-play — a raise, a breakup, a co-founder split, whatever you're facing.",
    icon: "pencil",
    color: "#555555",
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

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative w-full scroll-mt-20 overflow-hidden py-16 sm:py-20">
      {/* ambient floating decorative shapes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d18" }}
        animate={{ y: [0, 26, 0], x: [0, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "#0d0d0d14" }}
        animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
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
          <div className="mb-3 inline-flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: "#78787820", color: "#787878" }}
            >
              <Icon name="message" size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Questions &amp; answers
            </span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            The <span className="marker">honest</span> FAQ
          </h2>
          <p className="mt-3 text-muted">
            No fine print, no dark patterns. Here's exactly how Rehearse works.
          </p>
        </motion.div>

        {/* accordion */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 flex flex-col gap-3"
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={faq.q}
                variants={item}
                className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
                style={
                  isOpen
                    ? { boxShadow: `0 0 0 1.5px ${faq.color}66` }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors"
                    style={{
                      backgroundColor: `${faq.color}20`,
                      color: faq.color,
                    }}
                  >
                    <Icon name={faq.icon} size={20} />
                  </span>

                  <span className="flex-1 font-display text-base font-extrabold tracking-tight sm:text-lg">
                    {faq.q}
                  </span>

                  <motion.span
                    aria-hidden
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isOpen ? faq.color : "transparent",
                      color: isOpen ? "#fff" : faq.color,
                    }}
                  >
                    <Icon name="arrowRight" size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { type: "spring", stiffness: 260, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pl-[4.5rem] sm:px-6 sm:pl-[5.25rem]">
                        <div
                          className="mb-4 h-px w-full"
                          style={{ backgroundColor: `${faq.color}30` }}
                        />
                        <p className="text-sm leading-relaxed text-muted sm:text-base">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-surface-2 p-6 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight">
              Still wondering if it'll work for you?
            </p>
            <p className="mt-1 text-sm text-muted">
              The fastest way to find out is one free session.
            </p>
          </div>
          <a
            href="#start"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent text-accent-fg shadow-btn px-5 py-2.5 text-sm font-semibold"
          >
            Start practicing <Icon name="arrowRight" size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
