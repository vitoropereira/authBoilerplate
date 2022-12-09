import { prisma } from "src/lib/prisma";
import {
  UserCreateData,
  UsersRepository,
} from "src/repositories/usersRepository";

export class PrismaUsersRepository implements UsersRepository {
  async create({ email, password, username, features }: UserCreateData) {
    const user = await prisma.user.create({
      data: { email, password, username, features },
    });
    return user;
  }

  async findUserByUsername(username: string) {
    const user = await prisma.user.findFirst({ where: { username } });
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    return user;
  }
}
