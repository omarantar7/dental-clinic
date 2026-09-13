"use client";

import { useMemo, useState } from "react";

import type { ChartConfig } from "@/components/ui/chart";
import { InteractiveAreaChart } from "@/features/analytics/components/interactive-area-chart";
import { StatCards } from "@/features/analytics/components/stat-cards";
import { formatCurrency } from "@/utils/format";
import type { AreaChartSeries } from "../types/interactive-area-props";
import type { SummaryChartProps } from "../types/summary-charts-props";

function SummaryChart({ summary, newPatientsOnly }: SummaryChartProps) {
  const patientsLabel = newPatientsOnly ? "New Patients" : "Patients";

  const series: AreaChartSeries[] = useMemo(
    () => [
      {
        key: "patients",
        label: patientsLabel,
        total: summary.patients.total,
        axis: "count",
        color: "var(--chart-1)",
      },
      {
        key: "sessions",
        label: "Sessions",
        total: summary.sessions.total,
        axis: "count",
        color: "var(--chart-2)",
      },
      {
        key: "revenue",
        label: "Revenue",
        total: summary.revenue.total,
        axis: "currency",
        color: "var(--chart-3)",
        formatValue: formatCurrency,
      },
      {
        key: "paid",
        label: "Paid",
        total: summary.paid.total,
        axis: "currency",
        color: "var(--chart-4)",
        formatValue: formatCurrency,
      },
      {
        key: "unpaid",
        label: "Unpaid",
        total: summary.unpaid.total,
        axis: "currency",
        color: "var(--chart-5)",
        formatValue: formatCurrency,
      },
    ],
    [summary, patientsLabel],
  );

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(series.map((item) => item.key)),
  );

  const toggleKey = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const config: ChartConfig = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  );

  const data = summary.patients.chart.map((point, index) => ({
    date: point.date,
    patients: point.value,
    sessions: summary.sessions.chart[index]?.value ?? 0,
    revenue: summary.revenue.chart[index]?.value ?? 0,
    paid: summary.paid.chart[index]?.value ?? 0,
    unpaid: summary.unpaid.chart[index]?.value ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <StatCards
        series={series}
        visibleKeys={visibleKeys}
        onToggle={toggleKey}
      />
      <InteractiveAreaChart
        title="Overview"
        description="Click a metric above to show or hide it"
        config={config}
        data={data}
        series={series}
        visibleKeys={visibleKeys}
      />
    </div>
  );
}

export { SummaryChart };
