import nextConnect from "next-connect";

import { NextApiRequest, NextApiResponse } from "next";
import { CreateUser } from "src/models/user";
import { PrismaUsersRepository } from "src/repositories/prisma/prismaUsersRepository";
import validator from "src/models/validator";
import authorization from "src/models/authorization";
import controller, { RequestProps } from "src/models/controller";
import { User } from "@prisma/client";
import authentication from "src/models/authentication";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .post(
    postValidationHandler,
    authorization.canRequest("create:user"),
    postHandler
  );

async function postHandler(request: RequestProps, response: NextApiResponse) {
  const prismaUsersRepository = new PrismaUsersRepository();
  const createUser = new CreateUser(prismaUsersRepository);

  const newUser = await createUser.create(request.body);

  // await activation.createAndSendActivationEmail(newUser);

  const secureOutputValues: User = authorization.filterOutput(
    newUser,
    "read:user",
    newUser
  );

  const data = {
    user: secureOutputValues,
  };

  return response.status(201).json(data);
}

function postValidationHandler(
  request: NextApiRequest,
  response: NextApiResponse,
  next: () => void
) {
  const keys = {
    username: "required",
    email: "required",
    password: "required",
  };
  const userDataValidator = {
    object: request.body,
    keys,
  };

  const cleanValues = validator(userDataValidator);
  cleanValues.features = [
    "read:activation_token",
    "create:session",
    "create:user",
  ];

  request.body = cleanValues;

  next();
}
