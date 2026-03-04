const colors = {
  blue: "bg-[var(--request-blue-bg)] text-[var(--request-blue)] border border-[var(--request-blue)]/20",
  green: "bg-[var(--offer-green-bg)] text-[var(--offer-green)] border border-[var(--offer-green)]/20",
  red: "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20",
  yellow: "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20",
  gray: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]",
  purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  accent: "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/20",
} as const;

interface BadgeProps {
  color?: keyof typeof colors;
  children: React.ReactNode;
}

export function Badge({ color = "gray", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold font-[Outfit] tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): keyof typeof colors {
  switch (status) {
    case "ACTIVE": return "green";
    case "MATCHED": return "blue";
    case "PROPOSED": return "yellow";
    case "ACCEPTED": return "blue";
    case "CONFIRMED_BY_GIVER":
    case "CONFIRMED_BY_RECEIVER": return "purple";
    case "COMPLETED": return "green";
    case "CANCELLED": return "red";
    case "EXPIRED": return "gray";
    default: return "gray";
  }
}
