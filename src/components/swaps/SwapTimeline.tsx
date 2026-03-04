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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Swap Cancelled</p>
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    isDone ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  isDone
                    ? "text-green-700"
                    : isCurrent
                    ? "text-indigo-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && step.key === "CONFIRMING" && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Giver: {swap.giverConfirmed ? "✓" : "pending"} | Receiver:{" "}
                  {swap.receiverConfirmed ? "✓" : "pending"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
