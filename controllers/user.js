// Importaciones
const bcrypt = require("bcrypt");
const validateUser = require("../helpers/validateUser");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");

// accion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/user.js",
  });
};

// Registro
const register = async (req, res) => {
  // Recoger datos de la peticion
  let params = req.body;

  // Comprobar que me llegan bien
  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // Validar los datos
  try {
    const save = "create";
    validateUser(params, save);
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Validación no superada",
    });
  }

  // Control usuarios duplicados
  try {
    const existUser = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() },
      ],
    });

    if (existUser && existUser.length >= 1) {
      return res.status(200).send({
        status: "error",
        message: "El usuario ya existe",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la consulta de usuarios duplicados",
    });
  }

  // Cifrar la contraseña
  let pwd = await bcrypt.hash(params.password, 10);
  params.password = pwd;

  // Guardar usuario en la bd
  try {
    let userToSave = new User(params);
    let userStored = await userToSave.save();
    if (userStored) {
      // Limpiar el objeto a devolver
      let userCreated = userStored.toObject();
      delete userCreated.password;
      delete userCreated.role;
      // Devolver un resultado
      return res.status(200).send({
        status: "success",
        message: "Usuario registrado correctamente",
        user: userCreated,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la consulta de guardar usuario",
    });
  }
};

const login = async (req, res) => {
  // Recoger los parametros de la peticion
  let params = req.body;

  // Comprobar que me llegan
  if (!params.email && !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // Buscar en la bd si existe el email
  try {
    let userFind = await User.findOne({ email: params.email }).select(
      "+password +role"
    );
    if (!userFind) {
      return res.status(404).send({
        status: "error",
        message: "No existe el usuario",
      });
    }

    // Comprobar su contraseña
    const pwd = bcrypt.compareSync(params.password, userFind.password);

    if (!pwd) {
      return res.status(400).send({
        status: "error",
        message: "Login incorrecto",
      });
    }
    // Limpiar objetps
    let identityUser = userFind.toObject();
    delete identityUser.password;
    delete identityUser.role;

    // Conseguir token jwt(crera un servicio)
    const token = jwt.createToken(userFind);

    // Devolver datos usuario y token

    return res.status(200).send({
      status: "success",
      message: "Metodo de login",
      user: identityUser,
      token,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en consultando email en base",
    });
  }
};

const profile = async (req, res) => {
  //Recoger id usuario url
  const id = req.params._id;

  // Consulta para sacar los datos del perfil
  try {
    const userFind = await User.findById(id);

    if (!userFind) {
      return res.status(404).send({
        status: "error",
        message: "El usuario no existe",
      });
    }
    // Devolver resultado
    return res.status(200).send({
      status: "success",
      message: "Metodo profile",
      id,
      profile: userFind,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en consulta de busqueda de perfil por id",
    });
  }
};

const update = async (req, res) => {
  // Recoger datos usuario identificado
  let userIdentity = req.user;

  // Recoger datos a actualizar
  let userToUpdate = req.body;

  // Validar los datos
  try {
    const save = "edit";
    validateUser(userToUpdate, save);
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Validación no superada",
    });
  }

  try {
    // Comprobar si el usuario existe
    const userFind = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    if (!userFind || userFind < 1) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro usuario",
      });
    }

    // Comprobar si usuario existe y no soy yo el identificado
    let userIsset = false;
    userFind.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });

    // Si ya existe devuelvo una respuesta
    if (userIsset) {
      return res.status(200).send({
        status: "error",
        message: "El usuario ya existe",
      });
    }
    // Cifrar password si me llegara
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }

    try {
      // Buscar usuario en la bd y actualizar datos
      let userUpdated = await User.findByIdAndUpdate(
        { _id: userIdentity.id },
        userToUpdate,
        { new: true }
      );

      if (!userUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Error al actualizar",
        });
      }
      // Devolver respuesta
      return res.status(200).send({
        status: "success",
        message: "Metodo update datos usuario",
        user: userUpdated,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en consulta de usuario",
    });
  }
};

const upload = async (req, res) => {
  // Configuracion de subida(multer)

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
    const userUpdated = await User.findByOneAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );
    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de archivo",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Metodo subir imagenes",
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "success",
      message: "Error al cargar la imagen",
    });
  }
};

const avatar = (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;

  // Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;

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
  register,
  login,
  profile,
  update,
  upload,
  avatar,
};
