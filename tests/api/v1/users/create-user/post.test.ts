import { compare } from "bcrypt";
import { prisma } from "../../../../../src/lib/prisma";
import { clearDB, webserverUrl } from "../../../../orchestrator";

clearDB();

describe("POST /api/v1/users/create-users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUserName",
          email: "validemailCAPS@gmail.com",
          password: "validpassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(201);

      expect(responseBody.user).toEqual({
        id: responseBody.user["id"],
        username: "uniqueUserName",
        email: "validemailcaps@gmail.com",
        createdAt: responseBody.user["createdAt"],
        updatedAt: responseBody.user["updatedAt"],
      });

      expect(Date.parse(responseBody.user["createdAt"])).not.toEqual(NaN);
      expect(Date.parse(responseBody.user["updatedAt"])).not.toEqual(NaN);
    });

    test("With unique and valid data, and an unknown key", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "postWithUnknownKey",
          email: "postWithUnknownKey@gmail.com",
          password: "validpassword",
          unknownKey: "unknownValue",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(201);

      expect(responseBody.user).toEqual({
        id: responseBody.user["id"],
        username: "postWithUnknownKey",
        email: "postwithunknownkey@gmail.com",
        createdAt: responseBody.user["createdAt"],
        updatedAt: responseBody.user["updatedAt"],
      });

      expect(Date.parse(responseBody.user["createdAt"])).not.toEqual(NaN);
      expect(Date.parse(responseBody.user["updatedAt"])).not.toEqual(NaN);

      const userInDatabase = await prisma.users.findFirst({
        where: {
          id: responseBody.user["id"],
        },
      });

      if (userInDatabase) {
        expect(userInDatabase["email"]).toEqual("postwithunknownkey@gmail.com");
      }
    });

    test("With unique and valid data, but with 'untrimmed' values", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "extraSpaceInTheEnd ",
          email: " space.in.the.beggining@gmail.com",
          password: "validpassword ",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(201);

      expect(responseBody.user).toEqual({
        id: responseBody.user["id"],
        username: "extraSpaceInTheEnd",
        email: "space.in.the.beggining@gmail.com",
        createdAt: responseBody.user["createdAt"],
        updatedAt: responseBody.user["updatedAt"],
      });

      expect(Date.parse(responseBody.user["createdAt"])).not.toEqual(NaN);
      expect(Date.parse(responseBody.user["updatedAt"])).not.toEqual(NaN);

      const userInDatabase = await prisma.users.findFirst({
        where: {
          id: responseBody.user["id"],
        },
      });

      if (userInDatabase) {
        const passwordsMatch = await compare(
          "validpassword",
          userInDatabase["password"]
        );
        expect(passwordsMatch).toBe(true);
        expect(userInDatabase["email"]).toEqual(
          "space.in.the.beggining@gmail.com"
        );
      }
    });

    test('With "username" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" with a null value', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: null,
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "",
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: 12345,
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" containing non alphanumeric characters', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "invalid!user_name",
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" too long', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userWith31Characterssssssssssss",
          email: "valid@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "O 'username' é obrigatório."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha um 'username' e tente novamente!"
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:USERNAME_REQUIRE"
      );
    });

    test('With "username" in blocked list', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          email: "admin@email.com",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.errorResponse["statusCode"]).toEqual(400);
      expect(responseBody.errorResponse["message"]).toEqual(
        "Este nome de usuário não está disponível para uso."
      );
      expect(responseBody.errorResponse["action"]).toEqual(
        "Escolha outro nome de usuário e tente novamente."
      );
      expect(responseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:CHECK_BLOCKED_USERNAMES:BLOCKED_USERNAME"
      );
    });

    test('With "email" duplicated (same uppercase letters)', async () => {
      await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "anotherUserName111",
          email: "email.will.be.duplicated@gmail.com",
          password: "validpassword",
        }),
      });

      const secondResponse = await fetch(
        `${webserverUrl}/api/v1/users/create-user`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "anotherUserName222",
            email: "email.will.be.duplicated@gmail.com",
            password: "validpassword",
          }),
        }
      );

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toEqual(400);
      expect(secondResponseBody.errorResponse["statusCode"]).toEqual(400);
      expect(secondResponseBody.errorResponse["message"]).toEqual(
        "O email informado já está sendo usado."
      );
      expect(secondResponseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(secondResponseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:DUPLICATE_EMAIL"
      );
    });

    test('With "email" duplicated (different uppercase letters)', async () => {
      await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "anotherUserName11",
          email: "CAPS@gmail.com",
          password: "validpassword",
        }),
      });

      const secondResponse = await fetch(
        `${webserverUrl}/api/v1/users/create-user`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "anotherUserName22",
            email: "caps@gmail.com",
            password: "validpassword",
          }),
        }
      );

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toEqual(400);
      expect(secondResponseBody.errorResponse["statusCode"]).toEqual(400);
      expect(secondResponseBody.errorResponse["message"]).toEqual(
        "O email informado já está sendo usado."
      );
      expect(secondResponseBody.errorResponse["action"]).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(secondResponseBody.errorResponse["errorLocationCode"]).toEqual(
        "CREATE_USER:VALIDATOR:DUPLICATE_EMAIL"
      );
    });

    test('With "email" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "email" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: " ",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "email" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: 12345,
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "email" with invalid format', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "not.used.email@gmail.com@what",
          password: "validpassword123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "password" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "notusedemail@gmail.com",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "password" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "notusedemail@gmail.com",
          password: "",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "password" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "notusedemail@gmail.com",
          password: 123456,
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "password" too short', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "notusedemail@gmail.com",
          password: "<8chars",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "password" too long', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notUsedUserName",
          email: "notusedemail@gmail.com",
          password:
            "73characterssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "body" totally blank', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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

    test('With "body" containing a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/create-user`, {
        method: "post",
        body: "Please don't hack us, we are the good guys!",
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
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
});
