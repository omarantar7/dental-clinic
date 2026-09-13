import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCardsProps } from "../types/stat-card-props";

function StatCards({ series, visibleKeys, onToggle }: StatCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {series.map((item) => {
        const isVisible = visibleKeys.has(item.key);

        return (
          <Card
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => onToggle(item.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onToggle(item.key);
            }}
            style={
              isVisible
                ? ({ "--tw-ring-color": item.color } as React.CSSProperties)
                : undefined
            }
            className={cn(
              "cursor-pointer ring-1 transition-opacity select-none",
              isVisible ? "ring-2 opacity-100" : "ring-border/50 opacity-50",
            )}
          >
            <div className="flex flex-col gap-2 px-(--card-spacing)">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </span>
              </div>
              <span className="text-2xl font-semibold">
                {item.formatValue
                  ? item.formatValue(item.total)
                  : item.total.toLocaleString()}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export { StatCards };
