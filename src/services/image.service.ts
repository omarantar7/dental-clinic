import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ImageRepository } from "@/repositories/image.repository";
import { PatientRepository } from "@/repositories/patient.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { convertImageToWebp } from "@/lib/helpers/image";
import { getSignedImageUrl, r2, R2_BUCKET_NAME } from "@/lib/r2";
import type {
  ImageCreateInput,
  ImageResponse,
  ImageUpdateInput,
} from "@/types/images";
import { BadRequestException } from "@/exceptions/http/BadRequestException";

export class ImageService {
  private static async uploadFile(
    ownerId: string,
    keyPrefix: "patients" | "sessions",
    file: File,
  ): Promise<string> {
    const key = `${keyPrefix}/${ownerId}/${randomUUID()}.webp`;

    try {
      let webpBuffer: Buffer;
      try {
        webpBuffer = await convertImageToWebp(file);
      } catch (error) {
        throw new BadRequestException("file must be a valid image", {
          cause: error,
        });
      }

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        }),
      );

      return key;
    } catch (error) {
      await r2
        .send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))
        .catch(() => undefined);
      throw error;
    }
  }

  private static async uploadImage(
    ownerId: string,
    keyPrefix: "patients" | "sessions",
    data: ImageCreateInput,
    persistImage: (key: string) => Promise<ImageResponse>,
  ): Promise<ImageResponse> {
    let key: string | undefined;

    try {
      key = await this.uploadFile(ownerId, keyPrefix, data.file);

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

  private static async updateOwnedImage(
    ownerId: string,
    keyPrefix: "patients" | "sessions",
    imageId: string,
    data: ImageUpdateInput,
    getCurrentImage: () => Promise<{ url: string }>,
    updateImage: (
      data: Pick<ImageUpdateInput, "title"> & { url?: string },
    ) => Promise<ImageResponse>,
  ): Promise<ImageResponse> {
    const currentImage = await getCurrentImage();
    let newKey: string | undefined;
    let imageUpdated = false;

    try {
      if (data.file) {
        newKey = await this.uploadFile(ownerId, keyPrefix, data.file);
      }

      const nextUrl = newKey
        ? await getSignedImageUrl(newKey)
        : await getSignedImageUrl(currentImage.url);
      const image = await updateImage({ title: data.title, url: newKey });
      imageUpdated = true;

      if (newKey) {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: currentImage.url,
          }),
        );
      }

      return { ...image, url: nextUrl };
    } catch (error) {
      if (newKey && !imageUpdated) {
        await r2
          .send(
            new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: newKey }),
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

  static async deleteSessionImage(
    sessionId: string,
    doctorId: string,
    imageId: string,
  ): Promise<void> {
    await SessionRepository.getSessionById(sessionId, doctorId);
    const image = await ImageRepository.getSessionImage(sessionId, imageId);

    await r2.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: image.url }),
    );

    await ImageRepository.deleteSessionImage(sessionId, imageId);
  }

  static async updateSessionImage(
    sessionId: string,
    doctorId: string,
    imageId: string,
    data: ImageUpdateInput,
  ): Promise<ImageResponse> {
    await SessionRepository.getSessionById(sessionId, doctorId);

    return this.updateOwnedImage(
      sessionId,
      "sessions",
      imageId,
      data,
      () => ImageRepository.getSessionImage(sessionId, imageId),
      (updateData) =>
        ImageRepository.updateImage("SESSION", sessionId, imageId, updateData),
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

  static async updatePatientImage(
    patientId: string,
    doctorId: string,
    imageId: string,
    data: ImageUpdateInput,
  ): Promise<ImageResponse> {
    await PatientRepository.getPatient(patientId, doctorId);

    return this.updateOwnedImage(
      patientId,
      "patients",
      imageId,
      data,
      () => ImageRepository.getPatientImage(patientId, imageId),
      (updateData) =>
        ImageRepository.updateImage("PATIENT", patientId, imageId, updateData),
    );
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