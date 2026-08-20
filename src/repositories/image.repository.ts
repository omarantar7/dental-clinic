import prisma from "@/lib/db";
import type { ImageWithUrl } from "@/types/images";

export class ImageRepository {
  static async listPatientImages(patientId: string) {
    return prisma.image.findMany({
      where: {
        owner_type: "PATIENT",
        owner_id: patientId,
      },
      orderBy: { uploaded_at: "desc" },
    });
  }

  static async createPatientImage(patientId: string, data: ImageWithUrl) {
    return prisma.image.create({
      data: {
        owner_type: "PATIENT",
        owner_id: patientId,
        title: data.title,
        url: data.url,
      },
    });
  }
}
