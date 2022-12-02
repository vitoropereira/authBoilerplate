import { compare } from "bcrypt";
import { verify, decode, sign } from "jsonwebtoken";
import { prisma } from "../../../../../src/lib/prisma";
import {
  clearDB,
  createUsers,
  isTokenExpired,
  webserverUrl,
} from "../../../../orchestrator";

clearDB();

describe("POST /api/v1/users/auth", () => {
  describe("Anonymous user", () => {
    test("Using a valid email and password", async () => {
      const createUser = await createUsers({
        username: "newUser",
        email: "emailToBeFoundAndAccepted@gmail.com",
        password: "ValidPassword",
      });

      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailToBeFoundAndAccepted@gmail.com",
          password: "ValidPassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(201);

      const decodeToken = decode(responseBody.token);

      expect(decodeToken?.sub).toEqual(createUser.id);
    });

    test("Using a valid email/username and password, but wrong password", async () => {
      await createUsers({
        username: "newUser1",
        email: "wrongpassword@gmail.com",
        password: "wrongpassword",
      });

      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrongpassword@gmail.com",
          password: "IFORGOTMYPASSWORD",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);

      expect(responseBody.errorResponse["statusCode"]).toEqual(401);
      expect(responseBody.errorResponse["message"]).toEqual(
        "A senha informada não confere com a senha do usuário."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Verifique se a senha informada está correta e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "AUTH:PASSWORD:PASSWORD_MISMATCH"
      );
    });

    test("Using a valid email and password, but wrong email", async () => {
      await createUsers({
        username: "newUser1",
        email: "wrongemail@gmail.com",
        password: "wrongemail",
      });

      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "IFORGOTMYEMAIL@gmail.com",
          password: "wrongemail",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);

      expect(responseBody.errorResponse["statusCode"]).toEqual(401);
      expect(responseBody.errorResponse["message"]).toEqual(
        "Dados não conferem."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Verifique se os dados enviados estão corretos."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "AUTH:DATA_EXIST:DATA_MISMATCH"
      );
    });

    test("Using a valid password, but without email", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "validPassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'email' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'email' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:EMAIL_REQUIRE"
      );
    });

    test("Using a valid password, but empty email", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "",
          password: "validPassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'email' deve conter um email válido."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:EMAIL_VALID"
      );
    });

    test("Using a valid password, but email using number type", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: 12345,
          password: "validPassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'email' deve ser do tipo String."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:EMAIL_STRING"
      );
    });

    test("Using a valid password, but invalid email", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalidemail",
          password: "validPassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'email' deve conter um email válido."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:EMAIL_VALID"
      );
    });

    test("Using a valid password, but invalid email", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "ValidEmail@gmail.com",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'password' é um campo obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:PASSWORD_REQUIRE"
      );
    });

    test("Using a valid email, but empty password", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "ValidEmail@gmail.com",
          password: "",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'password' deve conter no mínimo 8 caracteres."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:PASSWORD_CARACTERES"
      );
    });

    test("Using a valid email, but small password", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "ValidEmail@gmail.com",
          password: "small",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'password' deve conter no mínimo 8 caracteres."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:PASSWORD_CARACTERES"
      );
    });

    test("Using a valid email, but too long password", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "ValidEmail@gmail.com",
          password:
            "73characterssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'password' deve conter no máximo 72 caracteres."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:PASSWORD_CARACTERES"
      );
    });

    test("Using a valid email, but too long password", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "ValidEmail@gmail.com",
          password: 12345678,
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'password' deve ser do tipo String."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:PASSWORD_STRING"
      );
    });

    test("Sending a blank body", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/auth`, {
        method: "POST",
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "Os dados são obrigatórios."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Você deve preencher todos os campos."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:BODY_REQUIRE"
      );
    });
  });

  // TESTAR LOGIN COM SENHA ERRADA
  // TESTAR SE O TOKEN GERADO PELO LOGIN CORRETO ESTA EXPIRADO
  // SE O TOKEN GERADO PELO LOGIN EXPIRA NO TEMPO CERTO

  describe("isTokenExpired", () => {
    it("should return true if jwt token expired", () => {
      const currentTimeInSecondsMinusThirtySeconds =
        Math.floor(Date.now() / 1000) - 30;
      const expiredToken = sign(
        { foo: "bar", exp: currentTimeInSecondsMinusThirtySeconds },
        "shhhhh"
      );

      expect(isTokenExpired(expiredToken)).toEqual(true);
    });

    it("should return false if jwt token not expired", () => {
      const currentTimeInSecondsPlusThirtySeconds =
        Math.floor(Date.now() / 1000) + 30;
      const notExpiredToken = sign(
        { foo: "bar", exp: currentTimeInSecondsPlusThirtySeconds },
        "shhhhh"
      );

      expect(isTokenExpired(notExpiredToken)).toEqual(false);
    });

    it("should return true if jwt token invalid", () => {
      expect(isTokenExpired("invalidtoken")).toEqual(true);
    });
  });
});
