"use client";

import { SwapData } from "@/types";

const steps = [
  { key: "PROPOSED", label: "Proposed" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "CONFIRMING", label: "Confirming" },
  { key: "COMPLETED", label: "Completed" },
];

function getActiveStep(status: string): number {
  switch (status) {
    case "PROPOSED": return 0;
    case "ACCEPTED": return 1;
    case "CONFIRMED_BY_GIVER":
    case "CONFIRMED_BY_RECEIVER": return 2;
    case "COMPLETED": return 3;
    case "CANCELLED": return -1;
    default: return 0;
  }
}

export function SwapTimeline({ swap }: { swap: SwapData }) {
  const activeStep = getActiveStep(swap.status);

  if (swap.status === "CANCELLED") {
    return (
      <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center">
        <p className="text-[var(--danger)] font-semibold font-[Outfit]">Swap Cancelled</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isDone = i < activeStep || (i === activeStep && swap.status === "COMPLETED");
        const isCurrent = i === activeStep && swap.status !== "COMPLETED";
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-[Outfit] transition-all ${
                  isDone
                    ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"
                    : isCurrent
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 shadow-lg shadow-[var(--accent-glow)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {isDone ? "\u2713" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    isDone ? "bg-[var(--success)]/30" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
            <div className="pt-1.5">
              <p
                className={`text-sm font-semibold font-[Outfit] ${
                  isDone
                    ? "text-[var(--success)]"
                    : isCurrent
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && step.key === "CONFIRMING" && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Giver: {swap.giverConfirmed ? "\u2713" : "pending"} | Receiver:{" "}
                  {swap.receiverConfirmed ? "\u2713" : "pending"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
