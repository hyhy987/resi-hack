const colors = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-700",
} as const;

interface BadgeProps {
  color?: keyof typeof colors;
  children: React.ReactNode;
}

export function Badge({ color = "gray", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}
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
