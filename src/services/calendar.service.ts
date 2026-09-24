import { SessionRepository } from "@/repositories/session.repository";
import type { CalendarEvent } from "@/types/calendar";
import { computePaymentStatus } from "@/lib/helpers/payment-status";

export class CalendarService {
  static async getEvents(
    doctorId: string,
    fromValue: string,
    toValue: string,
  ): Promise<CalendarEvent[]> {
    const from = new Date(`${fromValue}T00:00:00.000Z`);
    const to = new Date(`${toValue}T00:00:00.000Z`);

    const toExclusive = new Date(to);
    toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
    const sessions = await SessionRepository.listCalendarSessions(
      doctorId,
      from,
      toExclusive,
    );

    return sessions.flatMap((session) => {
      if (!session.session_start_date || !session.session_end_date) return [];

      const amountPaid = session.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      return {
        id: session.id,
        session_name: session.session_name,
        start: session.session_start_date,
        end: session.session_end_date,
        text: `${session.patient.full_name} - ${session.session_name}`,
        patient_id: session.patient_id,
        patient_name: session.patient.full_name,
        status: session.status,
        payment_status: computePaymentStatus(session.total_amount, amountPaid),
      };
    });
  }
}