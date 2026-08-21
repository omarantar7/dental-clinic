import { getBucketKey } from "@/lib/helpers/granularity";
import type { DashboardCard, DashboardQuery } from "@/types/dashboard";

interface Payment {
  amount: number;
}

interface Session {
  created_at: Date;
  total_amount: number;
  payments: Payment[];
}

export interface SessionAggregateResult {
  sessions: DashboardCard;
  revenue: DashboardCard;
  paid: DashboardCard;
  unpaid: DashboardCard;
}

export class SessionAggregator {
  static aggregate(
    sessions: Session[],
    buckets: string[],
    granularity: DashboardQuery["granularity"],
  ): SessionAggregateResult {
    const sessionsChart = new Map<string, number>();
    const revenueChart = new Map<string, number>();
    const paidChart = new Map<string, number>();
    const unpaidChart = new Map<string, number>();
    let revenue = 0;
    let paid = 0;

    for (const session of sessions) {
      const bucket = getBucketKey(session.created_at, granularity);
      const sessionPaid = session.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const sessionUnpaid = Math.max(0, session.total_amount - sessionPaid);

      sessionsChart.set(bucket, (sessionsChart.get(bucket) ?? 0) + 1);
      revenueChart.set(
        bucket,
        (revenueChart.get(bucket) ?? 0) + session.total_amount,
      );
      paidChart.set(bucket, (paidChart.get(bucket) ?? 0) + sessionPaid);
      unpaidChart.set(bucket, (unpaidChart.get(bucket) ?? 0) + sessionUnpaid);

      revenue += session.total_amount;
      paid += sessionPaid;
    }

    return {
      sessions: this.toCard(sessions.length, buckets, sessionsChart),
      revenue: this.toCard(revenue, buckets, revenueChart),
      paid: this.toCard(paid, buckets, paidChart),
      unpaid: this.toCard(Math.max(0, revenue - paid), buckets, unpaidChart),
    };
  }

  private static toCard(
    total: number,
    buckets: string[],
    values: Map<string, number>,
  ): DashboardCard {
    return {
      total,
      chart: buckets.map((date) => ({ date, value: values.get(date) ?? 0 })),
    };
  }
}
