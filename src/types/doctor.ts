import z from "zod";
import { UserValidationSchema } from "@/types/user";

const DoctorValidationSchema = z.object({
  user_id: z.string(),
  clinic_address: z.string().nullable(),
});

type Doctor = z.infer<typeof DoctorValidationSchema>;
type IdentifiableDoctor = Doctor & { id: string };

const RegisterDoctorSchema = UserValidationSchema.omit({ role: true }).extend({
  clinic_address: z.string().nullable(),
});

type RegisterDoctorInput = z.infer<typeof RegisterDoctorSchema>;

export {
  DoctorValidationSchema,
  RegisterDoctorSchema,
  type Doctor,
  type IdentifiableDoctor,
  type RegisterDoctorInput,
};
