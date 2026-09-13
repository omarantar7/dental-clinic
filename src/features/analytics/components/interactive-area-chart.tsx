"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/utils/format";
import { InteractiveAreaChartProps } from "../types/interactive-area-props";

const formatTickDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

function InteractiveAreaChart({
  title,
  description,
  config,
  data,
  series,
  visibleKeys,
}: InteractiveAreaChartProps) {
  const visibleSeries = series.filter((item) => visibleKeys.has(item.key));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {visibleSeries.length === 0 ? (
          <p className="flex h-62.5 items-center justify-center text-xs text-muted-foreground">
            Select a metric above to plot it.
          </p>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-62.5 w-full">
            <AreaChart data={data}>
              <defs>
                {series.map((item) => (
                  <linearGradient
                    key={item.key}
                    id={`fill-${item.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${item.key})`}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${item.key})`}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tickFormatter={formatTickDate}
              />
              <YAxis
                yAxisId="count"
                orientation="left"
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="currency"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatTickDate(String(value))}
                    formatter={(value, name) => {
                      const item = series.find((s) => s.key === name);
                      const formatted = item?.formatValue
                        ? item.formatValue(Number(value))
                        : Number(value).toLocaleString();
                      return (
                        <div className="flex w-full justify-between gap-4">
                          <span className="text-muted-foreground">
                            {item?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatted}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              {visibleSeries.map((item) => (
                <Area
                  key={item.key}
                  yAxisId={item.axis}
                  dataKey={item.key}
                  type="monotone"
                  stroke={`var(--color-${item.key})`}
                  strokeWidth={2}
                  fill={`url(#fill-${item.key})`}
                  fillOpacity={1}
                  dot={{ r: 3, strokeWidth: 2, fill: "var(--background)" }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export { InteractiveAreaChart };
