import type { Role } from "@/config/roles";

type LoginResponse = {
  userId: string;
  role: Role;
};

export { type LoginResponse };
