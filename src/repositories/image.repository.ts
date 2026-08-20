import prisma from "@/lib/db";
import type { ImageWithUrl } from "@/types/images";

export class ImageRepository {
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
