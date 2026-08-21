import prisma from "@/lib/db";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type { ImageUpdateInput, ImageWithUrl } from "@/types/images";

export class ImageRepository {
  static async getSessionImage(sessionId: string, imageId: string) {
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        owner_type: "SESSION",
        owner_id: sessionId,
      },
    });

    if (!image) {
      throw new NotFoundException("image not found");
    }

    return image;
  }

  static async deleteSessionImage(sessionId: string, imageId: string) {
    await this.getSessionImage(sessionId, imageId);

    return prisma.image.delete({
      where: { id: imageId },
    });
  }

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

  static async updateImage(
    ownerType: "PATIENT" | "SESSION",
    ownerId: string,
    imageId: string,
    data: Pick<ImageUpdateInput, "title"> & { url?: string },
  ) {
    const image = await prisma.image.findFirst({
      where: { id: imageId, owner_type: ownerType, owner_id: ownerId },
    });

    if (!image) {
      throw new NotFoundException("image not found");
    }

    return prisma.image.update({
      where: { id: imageId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
      },
    });
  }

  static async updatePatientImage(
    patientId: string,
    imageId: string,
    data: Pick<ImageUpdateInput, "title"> & { url?: string },
  ) {
    return this.updateImage("PATIENT", patientId, imageId, data);
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

  static async createSessionImage(sessionId: string, data: ImageWithUrl) {
    return prisma.image.create({
      data: {
        owner_type: "SESSION",
        owner_id: sessionId,
        title: data.title,
        url: data.url,
      },
    });
  }

  static async listSessionImages(sessionId: string) {
    return prisma.image.findMany({
      where: {
        owner_type: "SESSION",
        owner_id: sessionId,
      },
      orderBy: { uploaded_at: "desc" },
    });
  }
}
