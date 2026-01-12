import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "danger" | "warning" | "success";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
          variant === "default" && "bg-slate-100 text-slate-800",
          variant === "outline" && "border-slate-200 text-slate-600",
          variant === "danger" && "border-red-200 bg-red-50 text-red-700",
          variant === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
          variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
