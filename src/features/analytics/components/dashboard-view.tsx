"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { DateRangeControl } from "@/features/analytics/components/date-range-control";
import { SummaryChart } from "@/features/analytics/components/summary-chart";
import { useDashboardSummary } from "@/features/analytics/hooks/use-dashboard-summary";
import { useDateRange } from "@/features/analytics/hooks/use-date-range";

function DashboardView() {
  const { preset, from, to, applyPreset, applyCustomRange } = useDateRange();
  const [newPatientsOnly, setNewPatientsOnly] = useState(false);
  const { summary, isLoading, error } = useDashboardSummary({
    from,
    to,
    newPatientsOnly,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={1}>Dashboard</Heading>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={newPatientsOnly}
              onCheckedChange={(checked) =>
                setNewPatientsOnly(checked === true)
              }
            />
            New patients only
          </label>
          <DateRangeControl
            preset={preset}
            from={from}
            to={to}
            onPresetChange={applyPreset}
            onCustomRangeChange={applyCustomRange}
          />
        </div>
      </div>

      {isLoading && !summary && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-75 w-full" />
        </div>
      )}

      {error && <Text>Failed to load analytics.</Text>}

      {summary && (
        <SummaryChart summary={summary} newPatientsOnly={newPatientsOnly} />
      )}
    </div>
  );
}

export { DashboardView };
