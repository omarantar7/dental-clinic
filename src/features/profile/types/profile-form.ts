import z from "zod";

const ProfileFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  clinic_address: z.string(),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export { ProfileFormSchema, type ProfileFormValues };
