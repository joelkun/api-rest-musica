// Importar conexion a base de datos
const connection = require("./database/connection");

// Importar dependencias
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("API REST con Node para la app de musica arrancada!!");

// Ejecutar conexion a la bd
connection();

// Crear servidor de node
const app = express();
const port = 3910;

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar configuracion de rutas
const UserRoutes = require("./routes/user");
const ArtistRoutes = require("./routes/artist");
const AlbumRoutes = require("./routes/album");
const SongRoutes = require("./routes/song");

app.use("/api/user", UserRoutes);
app.use("/api/artist", ArtistRoutes);
app.use("/api/album", AlbumRoutes);
app.use("/api/song", SongRoutes);

// Ruta de prueba
app.get("/ruta-probando", (req, res) => {
  return res.status(200).send({
    id: 13,
    nombre: "Jonathan",
    apellido: "Villón",
  });
});

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
  console.log("Servidor de node está escuchando en el puerto:", port);
});
