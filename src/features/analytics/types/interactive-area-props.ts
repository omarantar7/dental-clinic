import type { ChartConfig } from "@/components/ui/chart";

interface AreaChartSeries {
  key: string;
  label: string;
  total: number;
  axis: "count" | "currency";
  color: string;
  formatValue?: (value: number) => string;
}

interface InteractiveAreaChartProps {
  title: string;
  description?: string;
  config: ChartConfig;
  data: Record<string, string | number>[];
  series: AreaChartSeries[];
  visibleKeys: Set<string>;
}

export { type AreaChartSeries, type InteractiveAreaChartProps };
