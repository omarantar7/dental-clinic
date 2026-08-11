import z from "zod";

const UserValidationSchema = z.object({
  role: z.enum(["DOCTOR", "SECRETARY"]),
  email: z.email(),
  full_name: z.string().min(3).max(30).nullable(),
  password_hash: z.string().min(8).max(60),
  phone_number: z.string(),
  address: z.string().nullable(),
}); 

type User = z.infer<typeof UserValidationSchema>;

type SafeUser = Omit<User, "password_hash"> & { id: string };

export { UserValidationSchema, type User, type SafeUser };
