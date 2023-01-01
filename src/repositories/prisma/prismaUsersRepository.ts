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
    console.log("username");
    console.log(username);
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    console.log("user -----------------");
    console.log(user);

    prisma.$disconnect();

    return user;
  }

  async findUserByUserId(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    return user;
  }

  async removeFeatures(userId: string, features: string[]) {
    const response = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        features,
      },
    });

    console.log(
      "----------- response --------------------- removeFeatures -----------"
    );
    console.log(response);
    if (response) {
      return true;
    } else {
      return false;
    }
  }

  async addFeatures(userId: string, features: string[]) {
    const response = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        features: [],
      },
    });

    console.log(
      "----------- response --------------------- addFeatures -----------"
    );
    console.log(response);
    if (response) {
      return true;
    } else {
      return false;
    }
  }
}
