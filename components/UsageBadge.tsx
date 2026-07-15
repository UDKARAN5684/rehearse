"use client";

export default function UsageBadge({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const safeUsed = Math.max(0, used);
  const remaining = Math.max(0, limit - safeUsed);
  const depleted = remaining === 0;
  const low = remaining <= 1 && !depleted;

  const tone = depleted
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
    : low
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300";

  const dot = depleted
    ? "bg-rose-500"
    : low
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tone}`}
      aria-label={`${remaining} of ${limit} free sessions remaining today`}
      title={`${remaining} of ${limit} free sessions remaining today`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {depleted ? (
        <>Daily limit reached</>
      ) : (
        <>
          <span className="tabular-nums">{remaining}</span> of{" "}
          <span className="tabular-nums">{limit}</span> free left today
        </>
      )}
    </span>
  );
}
