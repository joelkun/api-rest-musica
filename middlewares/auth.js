// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const { secret } = require("../helpers/jwt");

// Crear middleware
exports.auth = async (req, res, next) => {
  // Comprobar si me llega la cabecera auth
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La peticion no tiene la cabecera de autenticación",
    });
  }

  // Limpiar token
  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    // Decoficiar el token
    let payload = await jwt.decode(token, secret);

    // Comprobar la expiracion del token
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token expirado",
      });
    }

    // Agregar datos del usuario a la request
    req.user = payload;
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Token invalido",
    });
  }

  // Pasar a la ejecución de la acción
  next();
};
