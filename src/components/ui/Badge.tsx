interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

// Order status badge helper
export function OrderStatusBadge({
  status,
}: {
  status: string;
}) {
  const statusConfig: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    pending: { label: "قيد الانتظار", variant: "warning" },
    accepted: { label: "مقبول", variant: "info" },
    preparing: { label: "جاري التحضير", variant: "info" },
    picked_up: { label: "تم الاستلام", variant: "info" },
    on_way: { label: "في الطريق", variant: "info" },
    delivered: { label: "تم التوصيل", variant: "success" },
    cancelled: { label: "ملغي", variant: "danger" },
  };

  const config = statusConfig[status] || { label: status, variant: "default" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
