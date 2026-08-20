import sharp from "sharp";

export async function convertImageToWebp(file: File): Promise<Buffer> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  return sharp(inputBuffer).webp({ quality: 80 }).toBuffer();
}