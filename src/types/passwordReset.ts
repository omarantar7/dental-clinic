import z from "zod";

const RequestPasswordResetSchema = z.object({
  email: z.email(),
});

type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;

export { RequestPasswordResetSchema, type RequestPasswordResetInput };
