import type { ReactNode } from "react";

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-mutedForeground">
      <path d="M2 7h10m0 0L8.5 3.5M12 7 8.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const flow = ["Your wallet", "CC3 clearinghouse", "Rank locked"];

/** Where a deposit travels, end to end. */
export function FlowDiagram({ locked = false }: { locked?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {flow.map((label, index) => {
        const isLast = index === flow.length - 1;
        return (
          <span key={label} className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                isLast && locked
                  ? "border-brand bg-brand text-white"
                  : isLast
                    ? "border-brand text-brand"
                    : "border-border bg-background text-foreground"
              }`}
            >
              {isLast && locked ? "Rank locked" : label}
            </span>
            {index < flow.length - 1 ? <Arrow /> : null}
          </span>
        );
      })}
    </div>
  );
}

/** Repayment stack: money flows top to bottom, #1 gets paid first. */
export function TrancheDiagram({ youAreFirst = false }: { youAreFirst?: boolean }) {
  return (
    <div className="relative space-y-1.5 pl-5">
      <div aria-hidden="true" className="absolute bottom-2 left-1.5 top-2 w-px bg-border" />
      <div className={`flex items-center justify-between rounded-[6px] border px-3 py-2 ${youAreFirst ? "border-brand bg-brand/5" : "border-brand/60 bg-card"}`}>
        <span className="text-xs font-semibold text-foreground">#1 in line{youAreFirst ? " · you" : ""}</span>
        <span className="font-mono text-[10px] text-mutedForeground">repaid first</span>
      </div>
      <div className="flex items-center justify-between rounded-[6px] border border-border bg-card px-3 py-2">
        <span className="text-xs font-semibold text-foreground">#2 in line</span>
        <span className="font-mono text-[10px] text-mutedForeground">repaid after, earns more</span>
      </div>
    </div>
  );
}

/** Queue positions: your rank lands in one of these slots. */
export function QueueDiagram({ filled = false, youAreFirst = false }: { filled?: boolean; youAreFirst?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {["1", "2", "3"].map((position) => {
        const isYou = youAreFirst && position === "1";
        return (
          <span
            key={position}
            className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] ${
              isYou
                ? "border-brand bg-brand text-white"
                : filled && position === "1"
                  ? "border-brand text-brand"
                  : "border-border bg-card text-foreground"
            }`}
          >
            #{position}
          </span>
        );
      })}
      <span className="ml-1 font-mono text-[10px] text-mutedForeground">
        {youAreFirst ? "you are here" : filled ? "first seat taken" : "your place lands here"}
      </span>
    </div>
  );
}

export function DiagramBlock({
  label,
  note,
  children,
  live = false,
}: {
  label: string;
  note: string;
  children: ReactNode;
  live?: boolean;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-background p-4">
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${live ? "bg-brand" : "bg-mutedForeground/50"}`} />
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-mutedForeground">{note}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
