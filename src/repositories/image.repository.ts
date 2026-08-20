import prisma from "@/lib/db";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type { ImageWithUrl } from "@/types/images";

export class ImageRepository {
  static async getPatientImage(patientId: string, imageId: string) {
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        owner_type: "PATIENT",
        owner_id: patientId,
      },
    });

    if (!image) {
      throw new NotFoundException("image not found");
    }

    return image;
  }

  static async deletePatientImage(patientId: string, imageId: string) {
    await this.getPatientImage(patientId, imageId);

    return prisma.image.delete({
      where: { id: imageId },
    });
  }

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
