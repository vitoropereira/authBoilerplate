import { NextApiHandler, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import authentication from "src/models/authentication";
import authorization from "src/models/authorization";
import controller, { RequestProps } from "src/models/controller";
import validator from "src/models/validator";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .patch(
    patchValidationHandler,
    authorization.canRequest("read:activation_token"),
    patchHandler
  );

function patchValidationHandler(req: RequestProps) {
  const keys = {
    token_id: "required",
  };
  const userDataValidator = {
    object: req.body,
    keys,
  };
  const cleanValues = validator(userDataValidator);

  req.body = cleanValues;

  return NextResponse.next();
}

async function patchHandler(request, response) {
  const prismaUsersRepository = new PrismaUsersRepository();
  const createUser = new CreateUser(prismaUsersRepository);

  const userTryingToActivate = request.context.user;
  const insecureInputValues = request.body;

  //TODO: validate input values with the new validation strategy
  const secureInputValues = authorization.filterInput(
    userTryingToActivate,
    "read:activation_token",
    insecureInputValues
  );

  const tokenObject = await activation.activateUserUsingTokenId(
    secureInputValues.tokenId
  );

  const authorizedValuesToReturn = authorization.filterOutput(
    userTryingToActivate,
    "read:activation_token",
    tokenObject
  );

  return response.status(200).json(authorizedValuesToReturn);
}
