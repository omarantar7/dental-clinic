import { getBucketKey } from "@/lib/helpers/granularity";
import type { DashboardCard, DashboardQuery } from "@/types/dashboard";

interface Patient {
  id: string;
  created_at: Date;
}

interface Session {
  patient_id: string;
  created_at: Date;
}

export class PatientAggregator {
  static aggregate(
    patients: Patient[],
    sessions: Session[],
    buckets: string[],
    query: Pick<DashboardQuery, "granularity" | "newPatientsOnly">,
  ): DashboardCard {
    const chart = new Map<string, Set<string>>();
    let rows: Patient[];

    if (query.newPatientsOnly) {
      rows = patients;
      for (const patient of rows) {
        this.addToBucket(
          chart,
          patient.created_at,
          patient.id,
          query.granularity,
        );
      }
    } else {
      const patientsWithSessions = new Set(sessions.map((s) => s.patient_id));
      rows = patients.filter((patient) => patientsWithSessions.has(patient.id));
      for (const session of sessions) {
        this.addToBucket(
          chart,
          session.created_at,
          session.patient_id,
          query.granularity,
        );
      }
    }

    return {
      total: rows.length,
      chart: buckets.map((date) => ({
        date,
        value: chart.get(date)?.size ?? 0,
      })),
    };
  }

  private static addToBucket(
    chart: Map<string, Set<string>>,
    date: Date,
    patientId: string,
    granularity: DashboardQuery["granularity"],
  ) {
    const bucket = getBucketKey(date, granularity);
    const set = chart.get(bucket) ?? new Set<string>();
    set.add(patientId);
    chart.set(bucket, set);
  }
}
