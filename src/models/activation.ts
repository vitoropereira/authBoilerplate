import { User } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "errors";
import { ActivationRepository } from "src/repositories/activationsRepository";
import { EmailRepository } from "src/repositories/emailsRepository";
import { UsersRepository } from "src/repositories/usersRepository";
import authorization from "./authorization";
import { Emails } from "./emails";

export class ActivationUser {
  constructor(
    private activationRepository: ActivationRepository,
    private usersRepository: UsersRepository,
    private emailRepository: EmailRepository
  ) {}

  async createAndSendActivationEmail(user: User) {
    const tokenObject = await this.activationRepository.createToken(user.id);
    const emails = new Emails(this.emailRepository);
    if (tokenObject) {
      await emails.sendActivationEmailToUser(user, tokenObject.id);
    }
  }

  async activateUserUsingTokenId(tokenId: string) {
    let tokenObject = await this.activationRepository.findOneTokenById(tokenId);
    if (!tokenObject?.used) {
      tokenObject = await this.activationRepository.findOneValidTokenById(
        tokenId
      );
      if (tokenObject) {
        await this.activateUserByUserId(tokenObject.user_id);
        return await this.activationRepository.markTokenAsUsed(tokenObject.id);
      }
      return tokenObject;
    }
  }

  async activateUserByUserId(userId: string) {
    const userToActivate = await this.usersRepository.findUserByUserId(userId);
    if (userToActivate) {
      if (!authorization.can(userToActivate, "read:activation_token")) {
        throw new ForbiddenError({
          message: `Você não pode mais ler tokens de ativação.`,
          action:
            "Verifique se você já está logado ou tentando ativar novamente o seu ou outro usuário que já está ativo.",
          stack: new Error().stack,
          errorLocationCode:
            "MODEL:ACTIVATION:ACTIVATE_USER_BY_USER_ID:FEATURE_NOT_FOUND",
        });
      }

      // TODO: in the future, understand how to run
      // this inside a transaction, or at least
      // reduce how many queries are run.
      await this.usersRepository.removeFeatures(userToActivate.id, [
        "read:activation_token",
      ]);
      return await this.usersRepository.addFeatures(userToActivate.id, [
        "create:session",
        "read:session",
        "update:user",
      ]);
    } else {
      throw new NotFoundError({
        message: `Usuário não encontrado.`,
        action: "Verifique se o usuário realmente foi cadastrado com sucesso.",
        stack: new Error().stack,
        errorLocationCode:
          "MODEL:ACTIVATION:ACTIVATE_USER_BY_USER_ID:USER_NOT_FOUND",
      });
    }
  }
}
