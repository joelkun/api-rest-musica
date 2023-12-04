const Song = require("../models/song");

const fs = require("fs");
const path = require("path");

// accion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/song.js",
  });
};

const save = async (req, res) => {
  // recoger los datos que me llegan
  const data = req.body;

  // Crear un objeto con mi modelo
  const song = new Song(data);
  console.log(song);
  try {
    const songStored = await song.save();
    if (!songStored) {
      return res.status(500).send({
        status: "error",
        message: "La canción no se ha guardado",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Metodo de save",
      song: songStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al guardar canción",
      error,
    });
  }
};

const one = async (req, res) => {
  let songId = req.params.id;
  try {
    const song = await Song.findById(songId).populate("album");
    if (!song) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado la canción",
        song,
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Metodo buscar canción",
      song,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "La canción no existe",
      error,
    });
  }
};

const list = async (req, res) => {
  // recoger id de album
  const albumId = req.params.albumId;

  try {
    // hacer consulta
    const songs = await Song.find({ album: albumId })
      .populate({
        path: "album",
        populate: { path: "artist", model: "Artist" },
      })
      .sort("track");
    if (!songs) {
      return res.status(404).send({
        status: "error",
        message: "No se han encontrado canciones",
      });
    }
    //devolver resultado
    return res.status(200).send({
      status: "success",
      message: "Metodo listar canciones de album",
      songs,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en consulta de lista de canciones",
      error,
    });
  }
};

const update = async (req, res) => {
  // parametro url id de cancion
  let songId = req.params.id;

  // datos para guardar
  let data = req.body;

  try {
    const songUpdated = await Song.findByIdAndUpdate(songId, data, {
      new: true,
    });

    if (!songUpdated) {
      return res.status(500).send({
        status: "error",
        message: "No se ha podido actualizar la canción",
        song: songUpdated,
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Metodo de actualizacion de cancion",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar canción",
      error,
    });
  }
};

const remove = async (req, res) => {
  const songId = req.params.id;
  try {
    const songRemoved = await Song.findByIdAndRemove(songId);
    return res.status(200).send({
      status: "success",
      message: "La cancion ha sido eliminada",
      songRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar canción",
      error,
    });
  }
};

const upload = async (req, res) => {
  // Configuracion de subida(multer)

  // Recoder artistsId
  const songId = req.params.id;

  // Recoger fichero de imagen y comprobar si existe
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye archivo de música",
    });
  }
  // Conseguir el nombre del archivo
  let file = req.file.originalname;

  // Sacar info de la imagen
  const fileSplit = file.split(".");
  const extension = fileSplit[1];

  // Comprobar si la extension es valida
  if (extension != "mp3" && extension != "wav") {
    // Borrar archivo
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);

    // Devolver error
    return res.status(400).send({
      status: "error",
      message: "La extensión no es válida",
    });
  }
  // Si es corecto, guardar la imagen en bbdd
  try {
    const songUpdated = await Song.findByOneAndUpdate(
      { _id: songId },
      { file: req.file.filename },
      { new: true }
    );
    if (!songUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de archivo",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Metodo subir canción",
      song: songUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "success",
      message: "Error al cargar archivo de música",
    });
  }
};

const audio = (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;

  // Montar el path real de la imagen
  const filePath = "./uploads/songs/" + file;

  // Comprobar que existe el fichero
  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe el archivo de música",
      });
    }
    // Devolver el fichero tal cual
    return res.sendFile(path.resolve(filePath));
  });
};
//Exportar acciones
module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  remove,
  upload,
  audio,
};
