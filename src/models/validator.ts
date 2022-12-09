import { ValidationError } from "errors";
import Joi from "joi";
import { UserCreateData } from "src/repositories/usersRepository";

interface SchemasProps {
  [key: string]: () => Joi.ObjectSchema<any>;
}

interface ValidatorProps {
  object: UserCreateData;
  keys: {
    username?: string;
    email?: string;
    password?: string;
    session_id?: string;
    id?: string;
    used?: string;
    expires_at?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export default function validator({ object, keys }: ValidatorProps) {
  // Force the clean up of "undefined" values since JSON
  // doesn't support them and Joi doesn't clean
  // them up. Also handles the case where the
  // "object" is not a valid JSON.
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch (error) {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      action: "Verifique se o valor enviado é um JSON válido.",
      errorLocationCode: "MODEL:VALIDATOR:ERROR_PARSING_JSON",
      stack: new Error().stack,
      key: "object",
    });
  }

  let finalSchema = Joi.object<UserCreateData>().required().min(1).messages({
    "object.base": `Body enviado deve ser do tipo Object.`,
    "object.min": `Objeto enviado deve ter no mínimo uma chave.`,
  });

  for (const key of Object.keys(keys)) {
    const keyValidationFunction = schemas[key];
    finalSchema = finalSchema.concat(keyValidationFunction());
  }

  const { error, value } = finalSchema.validate(object, {
    stripUnknown: true,
    context: {
      required: keys,
    },
  });

  if (error) {
    throw new ValidationError({
      message: error.details[0].message,
      key:
        error?.details[0]?.context?.key ||
        error?.details[0]?.context?.type ||
        "object",
      errorLocationCode: "MODEL:VALIDATOR:FINAL_SCHEMA",
      stack: new Error().stack,
      type: error.details[0].type,
    });
  }

  return value;
}

const schemas: SchemasProps = {
  username: function () {
    return Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .trim()
        .invalid(null)
        .when("$required.username", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"username" é um campo obrigatório.`,
          "string.empty": `"username" não pode estar em branco.`,
          "string.base": `"username" deve ser do tipo String.`,
          "string.alphanum": `"username" deve conter apenas caracteres alfanuméricos.`,
          "string.min": `"username" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"username" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"username" possui o valor inválido "null".`,
        }),
    });
  },

  email: function () {
    return Joi.object({
      email: Joi.string()
        .email()
        .min(7)
        .max(254)
        .lowercase()
        .trim()
        .invalid(null)
        .when("$required.email", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"email" é um campo obrigatório.`,
          "string.empty": `"email" não pode estar em branco.`,
          "string.base": `"email" deve ser do tipo String.`,
          "string.email": `"email" deve conter um email válido.`,
          "any.invalid": `"email" possui o valor inválido "null".`,
        }),
    });
  },

  password: function () {
    return Joi.object({
      // Why 72 in max length? https://security.stackexchange.com/a/39851
      password: Joi.string()
        .min(8)
        .max(72)
        .trim()
        .invalid(null)
        .when("$required.password", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"password" é um campo obrigatório.`,
          "string.empty": `"password" não pode estar em branco.`,
          "string.base": `"password" deve ser do tipo String.`,
          "string.min": `"password" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"password" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"password" possui o valor inválido "null".`,
        }),
    });
  },

  body: function () {
    return Joi.object({
      body: Joi.string()
        .replace(/^\u200e|\u200e$|^\u200f|\u200f$|\u0000/g, "")
        .min(1)
        .max(20000)
        .trim()
        .invalid(null)
        .when("$required.body", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"body" é um campo obrigatório.`,
          "string.empty": `"body" não pode estar em branco.`,
          "string.base": `"body" deve ser do tipo String.`,
          "string.min": `"body" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"body" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"body" possui o valor inválido "null".`,
        }),
    });
  },

  created_at: function () {
    return Joi.object({
      created_at: Joi.date()
        .when("$required.created_at", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"created_at" é um campo obrigatório.`,
          "string.empty": `"created_at" não pode estar em branco.`,
          "string.base": `"created_at" deve ser do tipo Date.`,
        }),
    });
  },

  updated_at: function () {
    return Joi.object({
      updated_at: Joi.date()
        .when("$required.updated_at", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"updated_at" é um campo obrigatório.`,
          "string.empty": `"updated_at" não pode estar em branco.`,
          "string.base": `"updated_at" deve ser do tipo Date.`,
        }),
    });
  },
};
