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
});

export type EnvSchema = z.infer<typeof envSchema>;

export default envSchema.parse(process.env);
