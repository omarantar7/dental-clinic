import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ImageRepository } from "@/repositories/image.repository";
import { PatientRepository } from "@/repositories/patient.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { convertImageToWebp } from "@/lib/helpers/image";
import { getSignedImageUrl, r2, R2_BUCKET_NAME } from "@/lib/r2";
import type { ImageCreateInput, ImageResponse } from "@/types/images";
import { BadRequestException } from "@/exceptions/http/BadRequestException";

export class ImageService {
  private static async uploadImage(
    ownerId: string,
    keyPrefix: "patients" | "sessions",
    data: ImageCreateInput,
    persistImage: (key: string) => Promise<ImageResponse>,
  ): Promise<ImageResponse> {
    let key: string | undefined;

    try {
      let webpBuffer: Buffer;
      try {
        webpBuffer = await convertImageToWebp(data.file);
      } catch (error) {
        throw new BadRequestException("file must be a valid image", {
          cause: error,
        });
      }

      key = `${keyPrefix}/${ownerId}/${randomUUID()}.webp`;

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        }),
      );

      const image = await persistImage(key);

      return { ...image, url: await getSignedImageUrl(image.url) };
    } catch (error) {
      if (key) {
        await r2
          .send(
            new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
          )
          .catch(() => undefined);
      }
      throw error;
    }
  }

  static async createSessionImage(
    sessionId: string,
    doctorId: string,
    data: ImageCreateInput,
  ): Promise<ImageResponse> {
    await SessionRepository.getSessionById(sessionId, doctorId);

    return this.uploadImage(
      sessionId,
      "sessions",
      data,
      (key) =>
        ImageRepository.createSessionImage(sessionId, {
          title: data.title,
          url: key,
        }),
    );
  }

  static async listSessionImages(
    sessionId: string,
    doctorId: string,
  ): Promise<ImageResponse[]> {
    await SessionRepository.getSessionById(sessionId, doctorId);

    const images = await ImageRepository.listSessionImages(sessionId);

    return Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await getSignedImageUrl(image.url),
      })),
    );
  }

  static async deletePatientImage(
    patientId: string,
    doctorId: string,
    imageId: string,
  ): Promise<void> {
    await PatientRepository.getPatient(patientId, doctorId);
    const image = await ImageRepository.getPatientImage(patientId, imageId);

    await r2.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: image.url }),
    );

    await ImageRepository.deletePatientImage(patientId, imageId);
  }

  static async listPatientImages(
    patientId: string,
    doctorId: string,
  ): Promise<ImageResponse[]> {
    await PatientRepository.getPatient(patientId, doctorId);

    const images = await ImageRepository.listPatientImages(patientId);

    return Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await getSignedImageUrl(image.url),
      })),
    );
  }

  static async createPatientImage(
    patientId: string,
    doctorId: string,
    data: ImageCreateInput,
  ): Promise<ImageResponse> {
    await PatientRepository.getPatient(patientId, doctorId);

    return this.uploadImage(
      patientId,
      "patients",
      data,
      (key) =>
        ImageRepository.createPatientImage(patientId, {
          title: data.title,
          url: key,
        }),
    );
  }
}