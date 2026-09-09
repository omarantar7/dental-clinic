import z from "zod";

const loginValidation = z.object({
  email: z.email(),
  password: z.string().nonempty("Password is required"),
});

type LoginValidationType = z.infer<typeof loginValidation>;

export { loginValidation, type LoginValidationType };
