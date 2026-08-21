import { BucketBuilder } from "@/services/dashboard/bucket-builder";
import { PatientAggregator } from "@/services/dashboard/patient-aggregator";
import { SessionAggregator } from "@/services/dashboard/session-aggregator";
import {
  DashboardRepository,
} from "@/repositories/dashboard.repository";
import type { DashboardQuery, DashboardSummary, IDashboardRepository } from "@/types/dashboard";

export class DashboardService {
  constructor(
    private readonly repository: IDashboardRepository = new DashboardRepository(),
  ) {}

  async getSummary(
    doctorId: string,
    query: DashboardQuery,
  ): Promise<DashboardSummary> {
    const from = new Date(`${query.from}T00:00:00.000Z`);
    const to = new Date(`${query.to}T23:59:59.999Z`);

    const { patients, sessions } = await this.repository.getSummaryData(
      doctorId,
      from,
      to,
      query.newPatientsOnly,
    );

    const buckets = BucketBuilder.build(from, to, query.granularity);

    const patientsCard = PatientAggregator.aggregate(
      patients,
      sessions,
      buckets,
      query,
    );
    const {
      sessions: sessionsCard,
      revenue,
      paid,
      unpaid,
    } = SessionAggregator.aggregate(sessions, buckets, query.granularity);

    return {
      from: query.from,
      to: query.to,
      patients: patientsCard,
      sessions: sessionsCard,
      revenue,
      paid,
      unpaid,
    };
  }
}

// Convenience singleton for call sites that don't need custom DI (e.g. route handlers).
// For tests, construct DashboardService with a mock IDashboardRepository instead.
export const dashboardService = new DashboardService();
