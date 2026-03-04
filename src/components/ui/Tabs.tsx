"use client";

interface TabsProps {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-6 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium font-[Outfit] rounded-lg transition-all duration-200 cursor-pointer ${
            active === tab.key
              ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
