import type { AreaChartSeries } from "./interactive-area-props";

interface StatCardsProps {
  series: AreaChartSeries[];
  visibleKeys: Set<string>;
  onToggle: (key: string) => void;
}

export { type StatCardsProps };
