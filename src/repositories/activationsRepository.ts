import { ActivateAccountToken, User } from "@prisma/client";

export interface ActivationRepository {
  findOneTokenById: (tokenId: string) => Promise<ActivateAccountToken | null>;
  findOneValidTokenById: (
    tokenId: string
  ) => Promise<ActivateAccountToken | null>;
  markTokenAsUsed: (tokenId: string) => Promise<ActivateAccountToken | null>;
  createToken: (userId: string) => Promise<ActivateAccountToken | null>;
}
