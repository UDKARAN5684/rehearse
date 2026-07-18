"use client";
// Floating bottom-nav pill (Viktor Oddy signature): a persistent brand mark +
// primary CTA that rides above the landing while you scroll.
import { LogoMark } from "@/components/Logo";
import Icon from "@/components/Icon";

export default function BottomNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="glass pointer-events-auto flex items-center gap-2.5 rounded-full py-2 pl-4 pr-2 shadow-btn">
        <span className="inline-flex items-center gap-2 pr-1">
          <LogoMark className="h-5 w-5 text-[color:var(--gray-900)]" />
          <span className="hidden font-display text-lg font-bold tracking-tight text-[color:var(--gray-900)] sm:inline">
            Rehearse
          </span>
        </span>
        <a
          href="#start"
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--gray-900)] px-4 py-2 text-sm font-semibold text-white shadow-btn transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--white)]"
        >
          Start practicing
          <Icon name="arrowRight" size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
