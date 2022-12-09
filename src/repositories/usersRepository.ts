import { User } from "@prisma/client";

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  features: string[];
}

export interface UsersRepository {
  create: (data: UserCreateData) => Promise<User>;
  findUserByUsername: (username: string) => Promise<User | null>;
  findUserByEmail: (email: string) => Promise<User | null>;
}
