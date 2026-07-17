"use client";
// Fires a one-shot reveal by adding `.is-in` when the element scrolls into view.
// Pairs with the .reveal / .rise / .fade CSS in globals.css.
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  threshold = 0.18,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
