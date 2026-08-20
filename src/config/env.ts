import z from "zod";

const durationRegex = /^\d+(ms|s|m|h|d|w|y)$/;

const envSchema = z.object({
  NODE_ENV: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  JWT_SECRET_KEY: z.string(),
  TOKEN_EXPIRATION: z.string().regex(durationRegex),
  REFRESH_TOKEN_EXPIRATION: z.string().regex(durationRegex),
  OTP_EXPIRATION_MINUTES: z.coerce.number().default(10),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.email(),
  R2_ENDPOINT: z.url(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;

export default envSchema.parse(process.env);
