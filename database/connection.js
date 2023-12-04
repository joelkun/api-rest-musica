// Importar mongoose
const mongoose = require("mongoose");

// Metodo de conexion
const connection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/app_musica");
    console.log("Conectado correctamente a bd: app_musica");
  } catch (error) {
    console.log(error);
    throw new Error("No se ha establecido la conexión a la bbdd");
  }
};

// Exportar conexion
module.exports = connection;
