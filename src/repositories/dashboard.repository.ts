import prisma from "@/lib/db";
import type { DashboardSummaryData, IDashboardRepository } from "@/types/dashboard";

export class DashboardRepository implements IDashboardRepository {
  async getSummaryData(
    doctorId: string,
    from: Date,
    to: Date,
    newPatientsOnly: boolean,
  ): Promise<DashboardSummaryData> {
    const [patients, sessions] = await Promise.all([
      prisma.patient.findMany({
        where: {
          doctor_id: doctorId,
          status: { not: "DELETED" },
          ...(newPatientsOnly ? { created_at: { gte: from, lte: to } } : {}),
        },
        select: { id: true, created_at: true },
      }),
      prisma.session.findMany({
        where: {
          doctor_id: doctorId,
          status: { not: "DELETED" },
          created_at: { gte: from, lte: to },
        },
        select: {
          patient_id: true,
          created_at: true,
          total_amount: true,
          payments: { select: { amount: true } },
        },
      }),
    ]);

    return { patients, sessions };
  }
}

// Convenience singleton for call sites that don't need custom DI.
export const dashboardRepository = new DashboardRepository();