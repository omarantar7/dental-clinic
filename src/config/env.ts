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
  R2_KEY_PREFIX: z.string().default(""),
});

export type EnvSchema = z.infer<typeof envSchema>;

// `next build` imports route modules to collect their config, and the build
// has no runtime env (e.g. the Docker build stage). Validate at runtime only.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export default isBuildPhase
  ? (process.env as unknown as EnvSchema)
  : envSchema.parse(process.env);
