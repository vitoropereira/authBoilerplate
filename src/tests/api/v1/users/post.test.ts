import { compare } from "bcrypt";
import { prisma } from "src/lib/prisma";
import { clearDB, webserverUrl } from "src/tests/orchestrator";

clearDB();


describe("POST /api/v1/users/", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users`, {
        method: "POST",
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
        id: responseBody.user.id,
        username: "uniqueUserName",
        features: ["read:activation_token"],
        created_at: responseBody.user.created_at,
        updated_at: responseBody.user.updated_at,
      });

      expect(Date.parse(responseBody.user.created_at)).not.toEqual(NaN);
      expect(Date.parse(responseBody.user.updated_at)).not.toEqual(NaN);
    });

    test("With unique and valid data, and an unknown key", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
        id: responseBody.user.id,
        username: "postWithUnknownKey",
        features: ["read:activation_token"],
        created_at: responseBody.user.created_at,
        updated_at: responseBody.user.updated_at,
      });

      expect(Date.parse(responseBody.user["created_at"])).not.toEqual(NaN);
      expect(Date.parse(responseBody.user["updated_at"])).not.toEqual(NaN);

      const userInDatabase = await prisma.user.findFirst({
        where: {
          id: responseBody.user["id"],
        },
      });

      if (userInDatabase) {
        expect(userInDatabase["email"]).toEqual("postwithunknownkey@gmail.com");
      }
    });

    test("With unique and valid data, but with 'untrimmed' values", async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
        id: responseBody.user.id,
        username: "extraSpaceInTheEnd",
        features: ["read:activation_token"],
        created_at: responseBody.user.created_at,
        updated_at: responseBody.user.updated_at,
      });

      expect(Date.parse(responseBody.user.created_at)).not.toEqual(NaN);
      expect(Date.parse(responseBody.user.updated_at)).not.toEqual(NaN);

      const userInDatabase = await prisma.user.findFirst({
        where: {
          id: responseBody.user.id,
        },
      });

      if (userInDatabase) {
        const passwordsMatch = await compare(
          "validpassword",
          userInDatabase.password
        );
        expect(passwordsMatch).toBe(true);
        expect(userInDatabase.email).toEqual(
          "space.in.the.beggining@gmail.com"
        );
      }
    });

    test('With "username" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" é um campo obrigatório.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" with a null value', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" possui o valor inválido "null".'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" não pode estar em branco.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" deve ser do tipo String.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" containing non alphanumeric characters', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" deve conter apenas caracteres alfanuméricos.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" too long', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"username" deve conter no máximo 30 caracteres.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "username" in blocked list', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        "Este nome de usuário não está disponível para uso."
      );
      expect(responseBody.action).toEqual(
        "Escolha outro nome de usuário e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "UTILS_USER:CHECK_BLOCKED_USERNAMES:BLOCKED_USERNAME"
      );
    });

    test('With "email" duplicated (same uppercase letters)', async () => {
      await fetch(`${webserverUrl}/api/v1/users/`, {
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

      const secondResponse = await fetch(`${webserverUrl}/api/v1/users/`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "anotherUserName222",
          email: "email.will.be.duplicated@gmail.com",
          password: "validpassword",
        }),
      });

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toEqual(400);
      expect(secondResponseBody.statusCode).toEqual(400);
      expect(secondResponseBody.message).toEqual(
        "O email informado já está sendo usado."
      );
      expect(secondResponseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(secondResponseBody.errorLocationCode).toEqual(
        "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS"
      );
    });

    test('With "email" duplicated (different uppercase letters)', async () => {
      await fetch(`${webserverUrl}/api/v1/users/`, {
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

      const secondResponse = await fetch(`${webserverUrl}/api/v1/users/`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "anotherUserName22",
          email: "caps@gmail.com",
          password: "validpassword",
        }),
      });

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toEqual(400);
      expect(secondResponseBody.statusCode).toEqual(400);
      expect(secondResponseBody.message).toEqual(
        "O email informado já está sendo usado."
      );
      expect(secondResponseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(secondResponseBody.errorLocationCode).toEqual(
        "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS"
      );
    });

    test('With "email" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual('"email" é um campo obrigatório.');
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "email" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual('"email" não pode estar em branco.');
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "email" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual('"email" deve ser do tipo String.');
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "email" with invalid format', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"email" deve conter um email válido.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "password" missing', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"password" é um campo obrigatório.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "password" with an empty string', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"password" não pode estar em branco.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "password" that\'s not a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"password" deve ser do tipo String.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "password" too short', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"password" deve conter no mínimo 8 caracteres.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "password" too long', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
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
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        '"password" deve conter no máximo 72 caracteres.'
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "body" totally blank', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
        method: "post",
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        "Body enviado deve ser do tipo Object."
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });

    test('With "body" containing a String', async () => {
      const response = await fetch(`${webserverUrl}/api/v1/users/`, {
        method: "post",
        body: "Please don't hack us, we are the good guys!",
      });

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.statusCode).toEqual(400);
      expect(responseBody.message).toEqual(
        "Body enviado deve ser do tipo Object."
      );
      expect(responseBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(responseBody.errorLocationCode).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
    });
  });
});
