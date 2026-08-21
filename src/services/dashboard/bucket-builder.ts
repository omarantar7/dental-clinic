import { getGranularityStrategy, type Granularity } from "@/lib/helpers/granularity";

export class BucketBuilder {
  static build(from: Date, to: Date, granularity: Granularity): string[] {
    const { step, bucketKey } = getGranularityStrategy(granularity);
    const buckets: string[] = [];
    const current = new Date(from);
    current.setUTCHours(0, 0, 0, 0);

    while (current <= to) {
      buckets.push(bucketKey(current));
      step(current);
    }

    return [...new Set(buckets)];
  }
}
