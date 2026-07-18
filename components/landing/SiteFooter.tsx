"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

const links: { label: string; href: string }[] = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how" },
  { label: "Modes", href: "#modes" },
  { label: "Privacy", href: "#privacy" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-bg py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="mx-auto w-full max-w-6xl px-4"
      >
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Logo />
              <motion.span
                aria-hidden
                animate={{ y: [0, -3, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-accent"
              >
                <Icon name="spark" size={16} />
              </motion.span>
            </div>
            <p className="max-w-xs text-sm text-muted">
              Practice hard conversations and pressure-test big decisions before
              they happen.
            </p>
          </div>

          <motion.nav
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {links.map((link) => (
              <motion.a
                key={link.label}
                variants={item}
                href={link.href}
                whileHover={{ y: -2 }}
                className="text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted">
            <Icon name="shield" size={14} />
            Runs on open-source models. Your data stays in your browser.
          </p>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Rehearse
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
