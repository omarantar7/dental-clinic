import { cn } from "@/lib/utils";

const VARIANTS = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-muted-foreground/40",
} as const;

export type StatusDotVariant = keyof typeof VARIANTS;

type StatusDotProps = {
  variant: StatusDotVariant;
  label: string;
  className?: string;
};

export function StatusDot({ variant, label, className }: StatusDotProps) {
  return (
    <span
      title={label}
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        VARIANTS[variant],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
