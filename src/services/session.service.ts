import prisma from "@/lib/db";
import { SessionRepository } from "@/repositories/session.repository";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import type { SessionCreateInput, SessionUpdateInput } from "@/types/session";

export class SessionService {
  static async listSessions(
    doctorId: string,
    query: Parameters<typeof SessionRepository.listSessions>[1],
  ) {
    return SessionRepository.listSessions(doctorId, query);
  }

  static async getSessionsForPatient(
    patientId: string,
    doctorId: string,
    query: Parameters<typeof SessionRepository.listByPatientId>[2],
  ) {
    return SessionRepository.listByPatientId(patientId, doctorId, query);
  }

  static async getSession(id: string, doctorId: string) {
    return SessionRepository.getSessionDetail(id, doctorId);
  }

  static async createSession(doctorId: string, data: SessionCreateInput) {
    return prisma.$transaction(async (tx) => {
      await SessionRepository.lockDoctorSchedule(doctorId, tx);
      await SessionRepository.ensureNoTimeConflict(
        doctorId,
        data.session_start_date,
        data.session_end_date,
        undefined,
        tx,
      );
      return SessionRepository.createSession(doctorId, data, tx);
    });
  }

  static async updateSession(
    id: string,
    doctorId: string,
    data: SessionUpdateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      await SessionRepository.lockDoctorSchedule(doctorId, tx);
      const existing = await SessionRepository.getSessionById(
        id,
        doctorId,
        tx,
      );

      // Zod only checks the pair when both dates are sent, so validate
      // the final pair after merging with the stored values.
      const nextStart = data.session_start_date ?? existing.session_start_date;
      const nextEnd = data.session_end_date ?? existing.session_end_date;

      if (nextStart && nextEnd) {
        if (nextEnd <= nextStart) {
          throw new BadRequestException(
            "session_end_date must be after session_start_date",
          );
        }
        await SessionRepository.ensureNoTimeConflict(
          doctorId,
          nextStart,
          nextEnd,
          id,
          tx,
        );
      }

      return SessionRepository.updateSession(id, doctorId, data, tx);
    });
  }

  static async deleteSession(id: string, doctorId: string): Promise<void> {
    return SessionRepository.softDeleteSession(id, doctorId);
  }

  static async getPatientBalance(patientId: string, doctorId: string) {
    return SessionRepository.getPatientBalance(patientId, doctorId);
  }
}
