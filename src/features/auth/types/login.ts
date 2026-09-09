import type { Role } from "@/config/roles";

type LoginResponse = {
  userId: string;
  role: Role;
  permissions: string[];
};

export { type LoginResponse };
