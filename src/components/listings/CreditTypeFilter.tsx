"use client";

type CreditTypeFilterValue = "all" | "BREAKFAST" | "DINNER";

interface CreditTypeFilterProps {
  value: CreditTypeFilterValue;
  onChange: (value: CreditTypeFilterValue) => void;
}

export function CreditTypeFilter({ value, onChange }: CreditTypeFilterProps) {
  const options: { key: CreditTypeFilterValue; label: string }[] = [
    { key: "all", label: "All" },
    { key: "BREAKFAST", label: "Breakfast" },
    { key: "DINNER", label: "Dinner" },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-fit">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 text-xs font-bold font-[Outfit] rounded-md transition-all cursor-pointer ${
            value === opt.key
              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
