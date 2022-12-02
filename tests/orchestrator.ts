import { prisma } from "../src/lib/prisma";
import jwt from "jsonwebtoken";

export interface CreateUsersProps {
  username: string;
  email: string;
  password: string;
}

export const webserverUrl = `http://${process.env.WEBSERVER_HOST}:${process.env.WEBSERVER_PORT}`;

export function clearDB() {
  afterAll(async () => {
    const deleteUsers = prisma.users.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
  });
}

export async function createUsers({
  username,
  email,
  password,
}: CreateUsersProps) {
  const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const { user } = await response.json();
  return user;
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
