const validator = require("validator");

const validateUser = (params, save) => {
  let resultado = false;
  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");
  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 2, max: 60 });
  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  if (save == "create") {
    let password = !validator.isEmpty(params.password);

    if (!password) {
      throw new Error("No se ha superado la validación de password");
    } else {
      console.log("Validación superada en el password");
    }
  }

  if (params.surname) {
    let surname =
      !validator.isEmpty(params.surname) &&
      validator.isLength(params.surname, { min: 3, max: undefined }) &&
      validator.isAlpha(params.surname, "es-ES");

    if (!surname) {
      throw new Error(
        "No se ha superado la validación por apellido incorrecto"
      );
    } else {
      console.log("Validación superada en el apellido");
    }
  }

  if (!name || !nick || !email) {
    throw new Error("No se ha superado la validación");
  } else {
    console.log("Validación superada");
    resultado = true;
  }

  return resultado;
};

module.exports = validateUser;
