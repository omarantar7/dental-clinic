import { PatientRepository } from "@/repositories/patient.repository";
import { type PatientCreateInput } from "@/types/patient";

export class PatientService {
  static async getPatient(id: string, doctorId: string) {
    return PatientRepository.getPatient(id, doctorId);
  }

  static async listPatients(
    doctorId: string,
    query: Parameters<typeof PatientRepository.listPatients>[1],
  ) {
    return PatientRepository.listPatients(doctorId, query);
  }

  static async createPatient(doctorId: string, data: PatientCreateInput) {
    return PatientRepository.createPatient(doctorId, data);
  }
}
