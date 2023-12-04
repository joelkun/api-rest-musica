// Importaciones
const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");

const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// accion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/artist.js",
  });
};

const save = async (req, res) => {
  // Recoger datos del body
  let params = req.body;

  // Crear el objeto a guardar
  let artist = new Artist(params);

  // Guardarlo
  try {
    const artistStored = await artist.save();
    if (!artistStored) {
      return res.status(400).send({
        status: "error",
        message: "No se ha guardao el artista",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Metodo save",
      artist: artistStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en metodo save",
    });
  }
};

const one = async (req, res) => {
  // Sacar un parametro por url
  const artistId = req.params.id;

  // Find
  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(500).send({
        status: "error",
        message: "No existe el artista",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Metodo one",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en busqueda de artista",
    });
  }
};

const list = async (req, res) => {
  // sacar la posible pagina
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  //Definir numero de elementos por page
  const itemsPerPage = 5;

  // Find, ordenarlo y paginarlo
  try {
    const countArtist = await Artist.countDocuments();

    const artistList = await Artist.find()
      .sort("-name")
      .paginate(page, itemsPerPage);

    if (!artistList) {
      return res.status(404).send({
        status: "error",
        message: "No existen artistas",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Metodo list",
      page,
      itemsPerPage,
      TotalPage: Math.ceil(countArtist / itemsPerPage),
      artist: artistList,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error obteniendo el listado de artista",
    });
  }
};

const update = async (req, res) => {
  // Recorger id artista url
  const artistId = req.params.id;

  // Recoger datos del body
  const data = req.body;

  // Buscar y actualizar artista
  try {
    const artistUpdated = await Artist.findByIdAndUpdate(artistId, data, {
      new: true,
    });

    if (!artistUpdated) {
      return res.status(404).send({
        status: "error",
        message: "No se ha actualizado el artista",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Metodo update artista",
      artist: artistUpdated,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error actulizando artista",
    });
  }
};

const remove = async (req, res) => {
  // Sacar el id del artista de la url
  const artistId = req.params.id;
  try {
    // Hacer consulta para buscar y eliminar el artista con un await
    const artistRemoved = await Artist.findByIdAndDelete(artistId);
    const albumRemoved = await Album.find({ artist: artistId }).remove();

    albumRemoved.forEach(async (album) => {
      const songsRemoved = await Song.find({ album: album._id }).remove();

      album.remove();
    });

    // devolver resultado
    return res.status(200).send({
      status: "success",
      message: "Metodo borrado artista",
      artistRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el artista o alguno de sus elementos",
    });
  }
};

const upload = async (req, res) => {
  // Configuracion de subida(multer)

  // Recoder artistsId
  const artistId = req.params.id;

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
    const artistUpdated = await Artist.findByOneAndUpdate(
      { _id: artistId },
      { image: req.file.filename },
      { new: true }
    );
    if (!artistUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de archivo",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Metodo subir imagenes",
      artist: artistUpdated,
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
  const filePath = "./uploads/artists/" + file;

  // Comprobar que existe el fichero
  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }

    return res.sendFile(path.resolve(filePath));
  });
  // Devolver el fichero tal cual
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
  image,
};
