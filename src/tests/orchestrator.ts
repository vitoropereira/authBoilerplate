import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import { CreateUser } from "src/models/user";
import { UsersRepository } from "src/repositories/usersRepository";
import { PrismaUsersRepository } from "src/repositories/prisma/prismaUsersRepository";

export interface CreateUsersProps {
  username?: string;
  email?: string;
  password?: string;
  features?: string[];
}

export const webserverUrl = `http://${process.env.WEBSERVER_HOST}:${process.env.WEBSERVER_PORT}`;

export function clearDB() {
  afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
  });
}

export async function createUser(userObject?: CreateUsersProps) {
  const prismaUsersRepository = new PrismaUsersRepository();
  const createUser = new CreateUser(prismaUsersRepository);

  return await createUser.create({
    username:
      userObject?.username ||
      faker.internet.userName().replace("_", "").replace(".", ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "password",
    features: ["read:activation_token"],
  });
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwt.decode(token) as {
      exp: number;
    };
    const expirationDateTimeInSeconds = exp * 1000;

    return Date.now() >= expirationDateTimeInSeconds;
  } catch {
    return true;
  }
};
