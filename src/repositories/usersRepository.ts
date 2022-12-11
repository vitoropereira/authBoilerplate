import { User } from "@prisma/client";

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  features: string[];
}

export interface UsersRepository {
  create: (data: UserCreateData) => Promise<User>;
  findUserByUserId: (userId: string) => Promise<User | null>;
  findUserByUsername: (username: string) => Promise<User | null>;
  findUserByEmail: (email: string) => Promise<User | null>;
  removeFeatures: (userId: string, features: string[]) => Promise<boolean>;
  addFeatures: (userId: string, features: string[]) => Promise<boolean>;
}
