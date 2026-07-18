import type { ReactNode } from "react";

// Hand-drawn line-icon set (no emoji). 24×24, stroke-based, inherits currentColor.
const PATHS: Record<string, ReactNode> = {
  chat: (
    <>
      <path d="M20 11.4a7.5 7.5 0 0 1-10.9 6.7L4.5 19.5l1.3-4.5A7.5 7.5 0 1 1 20 11.4Z" />
      <path d="M8.5 10.5h7M8.5 13.5h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4.5 20 11" />
      <path d="M5.8 9.7V19.5h12.4V9.7" />
    </>
  ),
  message: (
    <path d="M20.5 14.5a2 2 0 0 1-2 2H8l-4.5 3.2V6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3" />
      <path d="M4 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6a3 3 0 0 1 0 5.6" />
      <path d="M20 19.5a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  heart: (
    <path d="M12 20C7 16.7 3.5 13.6 3.5 9.8A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 20.5 9.8C20.5 13.6 17 16.7 12 20Z" />
  ),
  receipt: (
    <>
      <path d="M6.5 3.5h11v17l-2.75-1.7L12 20.5l-2.75-1.7L6.5 20.5Z" />
      <path d="M9.5 8.5h5M9.5 12h5" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17Z" />
      <path d="M13.5 7 17 10.5" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8 12 2.6 2.6L16 9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </>
  ),
  spark: (
    <path d="M12 3.2l1.7 5.2a3 3 0 0 0 1.9 1.9l5.2 1.7-5.2 1.7a3 3 0 0 0-1.9 1.9L12 20.8l-1.7-5.2a3 3 0 0 0-1.9-1.9L3.2 12l5.2-1.7a3 3 0 0 0 1.9-1.9Z" />
  ),
  trendDown: (
    <>
      <path d="M3 7.5l6 6 3.5-3.5L21 16.5" />
      <path d="M21 11.5v5.5h-5.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5 3 20h18Z" />
      <path d="M12 10v4.5M12 17.4h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.7" />
      <path d="m4.5 18 4.5-4 3.5 3 3-2.5 4.5 4" />
    </>
  ),
  share: (
    <>
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="m8.7 10.8 6-3.4M8.7 13.2l6 3.4" />
    </>
  ),
  arrowRight: <path d="M5 12h13M12.5 6l6 6-6 6" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

// Map a scenario's category to an icon name.
export function categoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c === "work") return "briefcase";
  if (c === "home") return "home";
  if (c === "family") return "users";
  if (c === "relationships") return "heart";
  if (c === "money") return "receipt";
  return "pencil";
}

export default function Icon({
  name,
  className,
  size = 20,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.chat}
    </svg>
  );
}
