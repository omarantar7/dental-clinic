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

const UpdateDoctorProfileSchema = z
  .object({
    clinic_address: z.string().nullable(),
    phone_number: z.string(),
    address: z.string().nullable(),
    full_name: z.string().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>;

type DoctorProfile = {
  id: string;
  user_id: string;
  clinic_address: string | null;
  email: string;
  phone_number: string;
  address: string | null;
  full_name: string | null;
  created_at: Date;
  updated_at: Date;
};

export {
  DoctorValidationSchema,
  RegisterDoctorSchema,
  UpdateDoctorProfileSchema,
  type Doctor,
  type IdentifiableDoctor,
  type RegisterDoctorInput,
  type UpdateDoctorProfileInput,
  type DoctorProfile,
};
