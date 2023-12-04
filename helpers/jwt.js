// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta
const secret = "CLAVE_SECRETA_de_MI_proyecto_de_la_API_MuSical_15121869";

// Crear funcion para generar tokens
const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  // devolver token
  return jwt.encode(payload, secret);
};
// Exportar modulo
module.exports = {
  createToken,
  secret,
};
