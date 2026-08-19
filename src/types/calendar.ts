import z from "zod";

const CalendarQuerySchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
  })
  .refine((query) => query.to >= query.from, {
    message: "to must be on or after from",
    path: ["to"],
  });

type CalendarEvent = {
  id: string;
  session_name: string;
  start: Date;
  end: Date;
  text: string;
  patient_id: string;
  patient_name: string;
  status: "UNCOMPLETED" | "COMPLETED" | "DELETED";
  payment_status: "SCHEDULED" | "INPROGRESS" | "COMPLETED";
};

type CalendarQuery = z.infer<typeof CalendarQuerySchema>;

export { CalendarQuerySchema, type CalendarEvent, type CalendarQuery };
