import { prisma } from "../lib/prisma";
import retry from "async-retry";
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
const emailServiceUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

export function clearDB() {
  beforeAll(async () => {
    waitForAllServices();
  });

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

async function waitForAllServices() {
  // await waitForWebServer();
  await waitForDatabase();
  await waitForEmailService();

  // async function waitForWebServer() {
  //   return await retry(
  //     async (bail, tries) => {
  //       if (tries >= 25) {
  //         console.log(
  //           `> Trying to connect to Webserver #${tries}. Are you running the server with "npm run dev"?`
  //         );
  //       }
  //       await fetch(`${webserverUrl}/api/v1/status`);
  //     },
  //     {
  //       retries: 50,
  //       minTimeout: 10,
  //       maxTimeout: 1000,
  //       factor: 1.1,
  //     }
  //   );
  // }

  async function waitForDatabase() {
    return await retry(
      async (bail, tries) => {
        if (tries >= 25) {
          console.log(
            `> Trying to connect to Database #${tries}. Are you running the Postgres container?`
          );
        }

        await prisma.$connect();
        await prisma.$disconnect();
      },
      {
        retries: 50,
        minTimeout: 10,
        maxTimeout: 1000,
        factor: 1.1,
      }
    );
  }

  async function waitForEmailService() {
    return await retry(
      async (bail, tries) => {
        if (tries >= 25) {
          console.log(
            `> Trying to connect to Email Service #${tries}, Are you running the MailCatcher container?`
          );
        }
        await fetch(emailServiceUrl);
      },
      {
        retries: 50,
        minTimeout: 10,
        maxTimeout: 1000,
        factor: 1.1,
      }
    );
  }
}
