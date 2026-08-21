import z from "zod";

const DashboardQuerySchema = z
  .object({
    from: z.string().date(),
    to: z.string().date(),
    granularity: z.enum(["day", "month", "year"]).default("day"),
    newPatientsOnly: z
      .preprocess((value) => value === "true", z.boolean())
      .default(false),
  })
  .refine((data) => data.from <= data.to, {
    message: "from must be before or equal to to",
    path: ["from"],
  });

type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

type DashboardChartPoint = {
  date: string;
  value: number;
};

type DashboardCard = {
  total: number;
  chart: DashboardChartPoint[];
};

type DashboardSummary = {
  from: string;
  to: string;
  patients: DashboardCard;
  sessions: DashboardCard;
  revenue: DashboardCard;
  paid: DashboardCard;
  unpaid: DashboardCard;
};

interface DashboardSummaryData {
  patients: { id: string; created_at: Date }[];
  sessions: {
    patient_id: string;
    created_at: Date;
    total_amount: number;
    payments: { amount: number }[];
  }[];
}

interface IDashboardRepository {
  getSummaryData(
    doctorId: string,
    from: Date,
    to: Date,
    newPatientsOnly: boolean,
  ): Promise<DashboardSummaryData>;
}

export {
  DashboardQuerySchema,
  type DashboardQuery,
  type DashboardCard,
  type DashboardSummary,
  type DashboardSummaryData,
  type IDashboardRepository,
};
