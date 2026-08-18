import { SessionRepository } from "@/repositories/session.repository";
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
    return SessionRepository.createSession(doctorId, data);
  }

  static async updateSession(
    id: string,
    doctorId: string,
    data: SessionUpdateInput,
  ) {
    return SessionRepository.updateSession(id, doctorId, data);
  }

  static async deleteSession(id: string, doctorId: string): Promise<void> {
    return SessionRepository.softDeleteSession(id, doctorId);
  }

  static async getPatientBalance(patientId: string, doctorId: string) {
    return SessionRepository.getPatientBalance(patientId, doctorId);
  }
}
