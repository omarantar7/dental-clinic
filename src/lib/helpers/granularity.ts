import type { DashboardQuery } from "@/types/dashboard";

export type Granularity = DashboardQuery["granularity"];

interface GranularityStrategy {
  step: (date: Date) => void;
  bucketKey: (date: Date) => string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export const GRANULARITY_STRATEGIES: Record<Granularity, GranularityStrategy> =
  {
    day: {
      step: (date) => date.setUTCDate(date.getUTCDate() + 1),
      bucketKey: (date) =>
        `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    },
    month: {
      step: (date) => date.setUTCMonth(date.getUTCMonth() + 1),
      bucketKey: (date) =>
        `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-01`,
    },
    year: {
      step: (date) => date.setUTCFullYear(date.getUTCFullYear() + 1),
      bucketKey: (date) => `${date.getUTCFullYear()}-01-01`,
    },
  };

/**
 * Adding a new granularity (e.g. "week") now means adding one entry here —
 * no other file needs to change. That's the Open/Closed fix.
 */
export function getGranularityStrategy(
  granularity: Granularity,
): GranularityStrategy {
  const strategy = GRANULARITY_STRATEGIES[granularity];
  if (!strategy) {
    throw new Error(`Unsupported granularity: "${granularity}"`);
  }
  return strategy;
}

export function getBucketKey(date: Date, granularity: Granularity): string {
  return getGranularityStrategy(granularity).bucketKey(date);
}
