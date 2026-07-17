"use client";
// Route-level error boundary. Any render/runtime throw in the page (e.g. an
// off-spec model response that slips past the guards) shows this recoverable
// fallback instead of Next's blank "client-side exception" screen.
import { useEffect } from "react";
import Icon from "@/components/Icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it for debugging without leaking to the user.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted"
        aria-hidden
      >
        <Icon name="alert" size={26} />
      </div>
      <h1 className="text-xl font-semibold text-fg">Something went sideways</h1>
      <p className="text-sm text-muted">
        The app hit an unexpected error. Your saved people and past sessions are
        safe on this device.
      </p>
      <div className="mt-1 flex items-center gap-2">
        <button
          onClick={reset}
          className="rounded-full bg-accent text-accent-fg shadow-glow-sm px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition-all hover:border-fg/30 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
