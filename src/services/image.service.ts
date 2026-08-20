import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ImageRepository } from "@/repositories/image.repository";
import { PatientRepository } from "@/repositories/patient.repository";
import { convertImageToWebp } from "@/lib/helpers/image";
import { getSignedImageUrl, r2, R2_BUCKET_NAME } from "@/lib/r2";
import type { ImageCreateInput, ImageResponse } from "@/types/images";
import { BadRequestException } from "@/exceptions/http/BadRequestException";

export class ImageService {
  static async createPatientImage(
    patientId: string,
    doctorId: string,
    data: ImageCreateInput,
  ): Promise<ImageResponse> {
    await PatientRepository.getPatient(patientId, doctorId);

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

      key = `patients/${patientId}/${randomUUID()}.webp`;

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        }),
      );

      const image = await ImageRepository.createPatientImage(patientId, {
        title: data.title,
        url: key,
      });

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
}