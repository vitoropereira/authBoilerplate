import { prisma } from "src/lib/prisma";
import { ActivationRepository } from "../activationsRepository";

export class PrismaActivationRepository implements ActivationRepository {
  async findOneTokenById(tokenId: string) {
    const token = await prisma.activateAccountToken.findFirst({
      where: {
        id: tokenId,
      },
    });

    return token;
  }

  async findOneValidTokenById(tokenId: string) {
    const token = await prisma.activateAccountToken.findFirst({
      where: {
        id: tokenId,
      },
    });
    return token;
  }

  async markTokenAsUsed(tokenId: string) {
    const token = await prisma.activateAccountToken.update({
      where: {
        id: tokenId,
      },
      data: {
        used: true,
      },
    });

    return token;
  }

  async createToken(userId: string) {
    const token = await prisma.activateAccountToken.create({
      data: {
        user_id: userId,
        used: false,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return token;
  }
}
