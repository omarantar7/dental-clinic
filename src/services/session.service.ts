import { SessionRepository } from "@/repositories/session.repository";

export class SessionService {
  static async getSessionsForPatient(
    patientId: string,
    doctorId: string,
    query: Parameters<typeof SessionRepository.listByPatientId>[2],
  ) {
    return SessionRepository.listByPatientId(patientId, doctorId, query);
  }

  static async getPatientBalance(patientId: string, doctorId: string) {
    return SessionRepository.getPatientBalance(patientId, doctorId);
  }
}
