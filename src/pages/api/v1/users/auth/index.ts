import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ValidationError } from "../../../../../../errors";
import { checkBlockedUsernames } from "../../../../../../errors/blockList";
import { prisma } from "../../../../../lib/prisma";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authUser = z.object({
    email: z
      .string({ required_error: "The email is required." })
      .email({ message: "Invalid email" }),
    password: z
      .string({ required_error: "The password is required." })
      .min(8)
      .max(72)
      .trim(),
  });

  try {
    authUser.parse(req.body);
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

        if (err.issues[0].message === "Invalid email") {
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

  const { email, password } = authUser.parse(req.body);

  const lowEmail = email?.toLowerCase();

  const emailExist = await prisma.users.findFirst({
    where: {
      email: lowEmail,
    },
  });

  if (!emailExist) {
    const errorResponse = ValidationError({
      message: "Dados não conferem.",
      action: "Verifique se os dados enviados estão corretos.",
      errorLocationCode: "AUTH:DATA_EXIST:DATA_MISMATCH",
      statusCode: 401,
    });
    return res.status(401).send({ errorResponse });
  }

  const passwordMatch = await compare(password, emailExist.password);

  if (!passwordMatch) {
    const errorResponse = ValidationError({
      message: "A senha informada não confere com a senha do usuário.",
      action: "Verifique se a senha informada está correta e tente novamente.",
      errorLocationCode: "AUTH:PASSWORD:PASSWORD_MISMATCH",
      statusCode: 401,
    });
    return res.status(401).send({ errorResponse });
  }

  const token = sign(
    {
      email,
      username: emailExist.username,
      id: emailExist.id,
    },
    "f84bd34f3d21db4636b99b21d1869e17",
    {
      subject: emailExist.id,
      expiresIn: "1d",
    }
  );

  return res.status(201).send({ token });
}
