import { NextApiResponse } from "next";
import { RequestProps } from "./controller";

async function injectAnonymousOrUser(
  request: RequestProps,
  response: NextApiResponse,
  next: () => void
) {
  // if (request.cookies?.session_id) {
  //   const cleanCookies = validator(request.cookies, {
  //     session_id: "required",
  //   });
  //   request.cookies.session_id = cleanCookies.session_id;

  //   await injectAuthenticatedUser(request, response);
  //   return next();
  // } else {
  injectAnonymousUser(request);
  return next();
  // }

  // async function injectAuthenticatedUser(request, response) {
  //   const sessionObject = await session.findOneValidFromRequest(request);
  //   const userObject = await user.findOneById(sessionObject.user_id);

  //   if (!authorization.can(userObject, "read:session")) {
  //     throw new ForbiddenError({
  //       message: `Você não possui permissão para executar esta ação.`,
  //       action: `Verifique se este usuário já ativou a sua conta e recebeu a feature "read:session".`,
  //       errorLocationCode:
  //         "MODEL:AUTHENTICATION:INJECT_AUTHENTICATED_USER:USER_CANT_READ_SESSION",
  //     });
  //   }

  //   const sessionRenewed = await session.renew(sessionObject.id, response);

  //   request.context = {
  //     ...request.context,
  //     user: userObject,
  //     session: sessionRenewed,
  //   };
  // }

  function injectAnonymousUser(request: RequestProps) {
    const { features } = createAnonymous();
    request.context = {
      ...request.context,
    };
  }
}

function createAnonymous() {
  return {
    features: ["read:activation_token", "create:session", "create:user"],
  };
}

export default Object.freeze({
  injectAnonymousOrUser,
});
