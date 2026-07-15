"use client";
// Route-level error boundary. Any render/runtime throw in the page (e.g. an
// off-spec model response that slips past the guards) shows this recoverable
// fallback instead of Next's blank "client-side exception" screen.
import { useEffect } from "react";

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
      <div className="text-4xl" aria-hidden>
        😵‍💫
      </div>
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Something went sideways
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        The app hit an unexpected error. Your saved people and past sessions are
        safe on this device.
      </p>
      <div className="mt-1 flex items-center gap-2">
        <button
          onClick={reset}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
