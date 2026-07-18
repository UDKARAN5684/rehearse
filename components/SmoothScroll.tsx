"use client";
// Lenis-driven smooth scroll for the whole page, plus smooth anchor jumps.
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Smooth-scroll in-page anchor links (#start, #contact, back-to-top).
    // Compute an absolute target that clears the sticky header, so the section
    // lands crisply at the top instead of undershooting behind the header.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const header = document.querySelector("header");
        const headerH = header
          ? header.getBoundingClientRect().height
          : 0;
        const top =
          (target as HTMLElement).getBoundingClientRect().top +
          window.scrollY -
          headerH -
          16;
        lenis.scrollTo(Math.max(0, top), { duration: 1 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
