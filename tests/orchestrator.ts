import retry from "async-retry";
import { prisma } from "../src/lib/prisma";

export const webserverUrl = `http://${process.env.WEBSERVER_HOST}:${process.env.WEBSERVER_PORT}`;

export function clearDB() {
  afterAll(async () => {
    const deleteUsers = prisma.users.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
  });
}
