import z from "zod";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const ImageCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  file: z
    .instanceof(File, { message: "file is required" })
    .refine(
      (file) =>
        [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
          "image/bmp",
          "image/tiff",
        ].includes(file.type),
      "file must be a PNG, JPEG, WebP, GIF, BMP, or TIFF image",
    )
    .refine(
      (file) => file.size <= MAX_IMAGE_FILE_SIZE,
      "file size must not exceed 5 MB",
    ),
});

const ImageUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    file: z
      .instanceof(File, { message: "file must be a valid image" })
      .refine(
        (file) =>
          [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/tiff",
          ].includes(file.type),
        "file must be a PNG, JPEG, WebP, GIF, BMP, or TIFF image",
      )
      .refine(
        (file) => file.size <= MAX_IMAGE_FILE_SIZE,
        "file size must not exceed 5 MB",
      )
      .optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.file !== undefined,
    "title or file is required",
  );

type ImageCreateInput = z.infer<typeof ImageCreateSchema>;
type ImageUpdateInput = z.infer<typeof ImageUpdateSchema>;

type ImageResponse = {
  id: string;
  owner_type: "PATIENT" | "SESSION";
  owner_id: string;
  title: string;
  url: string;
  uploaded_at: Date;
  created_at: Date;
};

type ImageWithUrl = Omit<ImageCreateInput, "file"> & { url: string };

export {
  MAX_IMAGE_FILE_SIZE,
  ImageCreateSchema,
  ImageUpdateSchema,
  type ImageCreateInput,
  type ImageUpdateInput,
  type ImageResponse,
  type ImageWithUrl,
};
