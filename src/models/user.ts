import { hash } from "bcrypt";
import { ValidationError } from "errors";
import { UsersRepository } from "src/repositories/usersRepository";
import { checkBlockedUsernames } from "src/utils/users";

import validator from "./validator";

interface UserCreateData {
  username: string;
  email: string;
  password: string;
  features: string[];
}

export class CreateUser {
  constructor(private usersRepository: UsersRepository) {}
  async create(request: UserCreateData) {
    const validateUserData = validatePostSchema(request);
    checkBlockedUsernames(validateUserData.username);
    console.log("validateUserData 2");
    console.log(validateUserData);
    const existUser = await this.usersRepository.findUserByUsername(
      validateUserData.username
    );

    if (existUser) {
      throw new ValidationError({
        message: `O "username" informado já está sendo usado.`,
        errorLocationCode: "MODEL:USER:VALIDATE_UNIQUE_USERNAME:ALREADY_EXISTS",
        key: "username",
      });
    }

    await this.validateUniqueEmail(validateUserData.email);
    validateUserData.password = await this.hashPassword(
      validateUserData.password
    );

    validateUserData.features = ["read:activation_token"];

    const user = await this.usersRepository.create(validateUserData);

    return user;
  }

  async validateUniqueEmail(email: string) {
    const existEmail = await this.usersRepository.findUserByEmail(email);

    if (existEmail) {
      throw new ValidationError({
        message: "O email informado já está sendo usado.",
        errorLocationCode: "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS",
        key: "email",
      });
    }
  }

  async hashPassword(unhashedPassword: string) {
    return await hash(unhashedPassword, 10);
  }
}

function validatePostSchema(postedUserData: UserCreateData): UserCreateData {
  const keys = {
    username: "required",
    email: "required",
    password: "required",
  };

  const userDataValidator = {
    object: postedUserData,
    keys,
  };

  const cleanValues = validator(userDataValidator);

  return cleanValues;
}
