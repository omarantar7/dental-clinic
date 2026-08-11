import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { UserRepository } from "@/repositories/user.repository";
import { SafeUser, User } from "@/types/user";
import bcrypt from "bcrypt";

export class UserService {
  static async createUser(data: User): Promise<SafeUser> {
    const user = await UserRepository.createUser(data);
    return user;
  }

  static async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser> {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw new NotFoundException("Invalid email or password");
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
