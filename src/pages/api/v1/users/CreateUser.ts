import { hash } from "bcrypt";
import { Console } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ValidationError } from "../../../../../errors";
import { checkBlockedUsernames } from "../../../../../errors/blockList";
import { prisma } from "../../../../lib/prisma";

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const createUser = z.object({
    username: z
      .string({ required_error: "The username is required." })
      .trim()
      .regex(new RegExp("^[a-zA-Z0-9]+$"))
      .min(3)
      .max(30),
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email address" })
      .min(7)
      .max(254),
    password: z
      .string({ required_error: "The password is required." })
      .min(8)
      .max(72)
      .trim(),
  });

  try {
    createUser.parse(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      if (err.issues[0].path.length == 0) {
        const errorResponse = ValidationError({
          message: "Os dados são obrigatórios.",
          action: "Você deve preencher todos os campos.",
          errorLocationCode: "CREATE_USER:VALIDATOR:BODY_REQUIRE",
          statusCode: 400,
        });
        return res.status(400).send({ errorResponse });
      }

      if (err.issues[0].path.includes("username")) {
        const errorResponse = ValidationError({
          message: "O 'username' é obrigatório.",
          action: "Escolha um 'username' e tente novamente!",
          errorLocationCode: "CREATE_USER:VALIDATOR:USERNAME_REQUIRE",
          statusCode: 400,
        });
        return res.status(400).send({ errorResponse });
      }

      if (err.issues[0].path.includes("email")) {
        if (err.issues[0].message === "Expected string, received number") {
          const errorResponse = ValidationError({
            message: "O 'email' deve ser do tipo String.",
            action: "Ajuste os dados enviados e tente novamente.",
            errorLocationCode: "CREATE_USER:VALIDATOR:EMAIL_STRING",
            statusCode: 400,
          });
          return res.status(400).send({ errorResponse });
        }

        if (err.issues[0].message === "Invalid email address") {
          const errorResponse = ValidationError({
            message: "O 'email' deve conter um email válido.",
            action: "Ajuste os dados enviados e tente novamente.",
            errorLocationCode: "CREATE_USER:VALIDATOR:EMAIL_VALID",
            statusCode: 400,
          });
          return res.status(400).send({ errorResponse });
        }

        const errorResponse = ValidationError({
          message: "O 'email' é obrigatório.",
          action: "Escolha um 'email' e tente novamente!",
          errorLocationCode: "CREATE_USER:VALIDATOR:EMAIL_REQUIRE",
          statusCode: 400,
        });
        return res.status(400).send({ errorResponse });
      }

      if (err.issues[0].path.includes("password")) {
        if (err.issues[0].message === "Expected string, received number") {
          const errorResponse = ValidationError({
            message: "O 'password' deve ser do tipo String.",
            action: "Ajuste os dados enviados e tente novamente.",
            errorLocationCode: "CREATE_USER:VALIDATOR:PASSWORD_STRING",
            statusCode: 400,
          });
          return res.status(400).send({ errorResponse });
        }

        if (
          err.issues[0].message ===
          "String must contain at least 8 character(s)"
        ) {
          const errorResponse = ValidationError({
            message: "O 'password' deve conter no mínimo 8 caracteres.",
            action: "Ajuste os dados enviados e tente novamente.",
            errorLocationCode: "CREATE_USER:VALIDATOR:PASSWORD_CARACTERES",
            statusCode: 400,
          });
          return res.status(400).send({ errorResponse });
        }

        if (
          err.issues[0].message ===
          "String must contain at most 72 character(s)"
        ) {
          const errorResponse = ValidationError({
            message: "O 'password' deve conter no máximo 72 caracteres.",
            action: "Ajuste os dados enviados e tente novamente.",
            errorLocationCode: "CREATE_USER:VALIDATOR:PASSWORD_CARACTERES",
            statusCode: 400,
          });
          return res.status(400).send({ errorResponse });
        }

        const errorResponse = ValidationError({
          message: "O 'password' é um campo obrigatório.",
          action: "Ajuste os dados enviados e tente novamente.",
          errorLocationCode: "CREATE_USER:VALIDATOR:PASSWORD_REQUIRE",
          statusCode: 400,
        });
        return res.status(400).send({ errorResponse });
      }
    }
  }

  const { username, email, password } = createUser.parse(req.body);

  if (username === "") {
    const errorResponse = ValidationError({
      message: "O 'username' é obrigatório.",
      action: "Escolha um 'username' e tente novamente!",
      errorLocationCode: "CREATE_USER:VALIDATOR:USERNAME_REQUIRE",
      statusCode: 400,
    });
    return res.status(400).send({ errorResponse });
  }

  const blockUsername = checkBlockedUsernames(username);

  if (blockUsername) {
    const errorResponse = blockUsername;
    return res.status(400).send({ errorResponse });
  }

  const lowEmail = email.toLowerCase();

  const emailExist = await prisma.users.findFirst({
    where: {
      email: lowEmail,
    },
  });

  if (emailExist) {
    const errorResponse = ValidationError({
      message: "O email informado já está sendo usado.",
      action: "Ajuste os dados enviados e tente novamente.",
      errorLocationCode: "CREATE_USER:VALIDATOR:DUPLICATE_EMAIL",
      statusCode: 400,
    });
    return res.status(400).send({ errorResponse });
  }

  const hashPassword = await hash(password, 10);

  const dataUser = await prisma.users.create({
    data: {
      username,
      email: lowEmail,
      password: hashPassword,
    },
  });

  const user = {
    id: dataUser.id,
    username: dataUser.username,
    email: dataUser.email,
    createdAt: dataUser.createdAt,
    updatedAt: dataUser.updatedAt,
  };
  return res.status(201).send({ user });
}
