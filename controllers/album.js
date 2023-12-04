// Importaciones
const Album = require("../models/album");
const Song = require("../models/song");

const fs = require("fs");
const path = require("path");

// accion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/album.js",
  });
};

const save = async (req, res) => {
  // Sacar datos enviados en el body
  let params = req.body;

  // Crear objeto
  let album = new Album(params);
  try {
    const albumStored = await album.save();
    if (!albumStored) {
      return res.status(500).send({
        status: "error",
        message: "Error al guardar album",
      });
    }
    // Guardar el objeto
    return res.status(200).send({
      status: "success",
      message: "Metodo guardar album",
      album,
    });
  } catch (error) {
    // Guardar el objeto
    return res.status(500).send({
      status: "error",
      message: "Error al guardar album",
    });
  }
};

const one = async (req, res) => {
  // sacar el id del album
  const albumId = req.params.id;
  try {
    // find y popular info del artist
    const album = await Album.findById(albumId).populate({ path: "artist" });

    if (!album) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado el album",
      });
    }
    // Devolve respuesta
    return res.status(200).send({
      status: "success",
      message: "Metodo find one",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la consulta de album",
    });
  }
};

const list = async (req, res) => {
  // Sacar el id del artista de la url
  const artistId = req.params.artistId;

  // Sacar todos los albums de la bbdd de un artistaen concreto
  if (!artistId) {
    return res.status(404).send({
      status: "error",
      message: "No se ha encontrado el artista",
    });
  }

  try {
    // Popular info del artista
    const albums = await Album.find({ artist: artistId }).populate("artist");

    if (!albums) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado albums",
      });
    }
    // devolver un resultado
    return res.status(200).send({
      status: "success",
      message: "Metodo List album",
      albums,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la consulta de album",
    });
  }
};

const update = async (req, res) => {
  // recoger param url
  const albumId = req.params.albumId;
  // recoger el body
  const data = req.body;
  try {
    // find y update
    const albumUpdated = await Album.findByIdAndUpdate(albumId, data, {
      new: true,
    });
    if (!albumUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Album no encontrado",
      });
    }
    // devolver resultado
    return res.status(200).send({
      status: "success",
      message: "El album se ha actualizado correctamente",
      album: albumUpdated,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la actualizacion del album",
    });
  }
};

const upload = async (req, res) => {
  // Configuracion de subida(multer)

  // Recoder artistsId
  const albumId = req.params.id;

  // Recoger fichero de imagen y comprobar si existe
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye la imagen",
    });
  }
  // Conseguir el nombre del archivo
  let image = req.file.originalname;

  // Sacar info de la imagen
  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  // Comprobar si la extension es valida
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
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
    const albumUpdated = await Album.findByOneAndUpdate(
      { _id: albumId },
      { image: req.file.filename },
      { new: true }
    );
    if (!albumUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de archivo",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Metodo subir imagenes",
      album: albumUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "success",
      message: "Error al cargar la imagen",
    });
  }
};

const image = (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;

  // Montar el path real de la imagen
  const filePath = "./uploads/albums/" + file;

  // Comprobar que existe el fichero
  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }
    // Devolver el fichero tal cual
    return res.sendFile(path.resolve(filePath));
  });
};

// Borrar Album
const remove = async (req, res) => {
  // Sacar el id del artista de la url
  const albumId = req.params.id;
  try {
    const albumRemoved = await Album.findById(albumId).remove();
    const songsRemoved = await Song.find({ album: albumId }).remove();

    // devolver resultado
    return res.status(200).send({
      status: "success",
      message: "Metodo borrado artista",
      albumRemoved,
      songsRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el artista o alguno de sus elementos",
    });
  }
};

//Exportar acciones
module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  upload,
  image,
  remove,
};
