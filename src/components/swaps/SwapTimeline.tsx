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
    case "PROPOSED":
      return 0;
    case "ACCEPTED":
      return 1;
    case "CONFIRMED_BY_GIVER":
    case "CONFIRMED_BY_RECEIVER":
      return 2;
    case "COMPLETED":
      return 3;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

export function SwapTimeline({ swap }: { swap: SwapData }) {
  const activeStep = getActiveStep(swap.status);

  if (swap.status === "CANCELLED") {
    return (
      <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center">
        <p className="text-[var(--danger)] font-semibold font-[Outfit]">
          Swap Cancelled
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center space-y-0">
      {steps.map((step, i) => {
        const isDone =
          i < activeStep || (i === activeStep && swap.status === "COMPLETED");
        const isCurrent = i === activeStep && swap.status !== "COMPLETED";

        return (
          <div key={step.key} className="flex flex-col">
            <div className="flex items-center gap-3 h-8">
              {" "}
              {/* Fixed height helper for centering */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-[Outfit] shrink-0 transition-all ${
                  isDone
                    ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"
                    : isCurrent
                      ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 shadow-lg shadow-[var(--accent-glow)]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              {/* Text is now perfectly vertically aligned with the center of the icon */}
              <p
                className={`text-xs font-bold font-[Outfit] uppercase tracking-wider leading-none ${
                  isDone
                    ? "text-[var(--success)]"
                    : isCurrent
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]"
                }`}
              >
                {step.label}
              </p>
            </div>

            {/* Connecting line shifted inside the loop logic */}
            {i < steps.length - 1 && (
              <div className="ml-4 w-0.5 h-3 bg-[var(--border)]">
                <div
                  className={`w-full h-full transition-all duration-500 ${isDone ? "bg-[var(--success)]/30" : "bg-transparent"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
