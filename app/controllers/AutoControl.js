"use strict";

var models = require("../models");
var auto = models.auto;
var formidable = require("formidable");
var fs = require("fs");
var extensiones = ["jpg", "png", "jpeg"];
const tamanioMax = 2 * 1024 * 1024;

class AutoControl {
  async listar(req, res) {
    var lista = await auto.findAll({
      attributes: [
        "modelo",
        "marca",
        "color",
        "anio",
        "foto",
        "precio",
        "estado",
        ["external_id", "id"],
      ],
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async obtenerAuto(req, res) {
    const external = req.params.external;
    var lista = await auto.findOne({
      where: { external_id: external },

      attributes: [
        "modelo",
        "marca",
        "color",
        "anio",
        "foto",
        "precio",
        "estado",
        ["external_id", "id"],
      ],
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async crear(req, res) {
    var UUID = require("uuid");
    // Lista de campos permitidos
    const camposPermitidos = ["modelo", "marca", "anio", "color", "precio"];

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    //console.log(req.body)
    //console.log(camposInvalidos)

    console.log(camposEnviados);
    if (
      camposInvalidos.length > 0 ||
      !camposPermitidos.every((campo) => camposEnviados.includes(campo))
    ) {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Campos no permitidos o incompletos",
        code: 400,
      });
      return;
    } else {
      var result = await auto.create({
        modelo: req.body.modelo,
        marca: req.body.marca,
        anio: req.body.anio,
        color: req.body.color,
        precio: req.body.precio,
        external_id: UUID.v4(),
      });
      if (result === null) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "NO se pudo crear",
          code: 401,
        });
      } else {
        res.status(200);
        res.json({
          msg: "OK",
          code: 200,
          data: result,
        });
      }
    }
  }

  async update(req, res) {
    var external = req.params.external;
    var lista = await auto.findOne({
      where: { external_id: external },
    });

    // Lista de campos permitidos
    const camposPermitidos = ["modelo", "marca", "anio", "color", "precio"];

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    //console.log(req.body)
    //console.log(camposInvalidos)

    console.log(camposEnviados);
    if (
      camposInvalidos.length > 0 ||
      !camposPermitidos.every((campo) => camposEnviados.includes(campo))
    ) {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Campos no permitidos o incompletos",
        code: 400,
      });
      return;
    } else {
      lista.modelo = req.body.modelo;
      lista.marca = req.body.marca;
      lista.anio = req.body.anio;
      lista.color = req.body.color;
      lista.precio = req.body.precio;
      await lista.save();
      if (lista === null) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "NO se pudo crear",
          code: 401,
        });
      } else {
        res.status(200);
        res.json({
          msg: "OK",
          code: 200,
          data: lista,
        });
      }
    }
  }

  async guardarFoto(req, res) {
    const externalAuto = req.params.external;
    var form = new formidable.IncomingForm(),
      files = [];

    form
      .on("file", function (field, file) {
        files.push(file);
      })
      .on("end", function () {
        console.log("OK");
      });

    form.parse(req, async function (err, fields) {
      let listado = files;
      let external = fields.external[0];
      let fotos = [];

      for (let index = 0; index < listado.length; index++) {
        var file = listado[index];
        var extension = file.originalFilename.split(".").pop().toLowerCase();

        if (file.size > tamanioMax) {
          res.status(400);
          return res.json({
            msg: "ERROR",
            tag: "El tamaño del archivo supera los 2MB ",
            code: 400,
          });
        }

        if (!extensiones.includes(extension)) {
          res.status(400);
          return res.json({
            msg: "ERROR",
            tag: "Solo soporta " + extensiones,
            code: 400,
          });
        }

        const name = external + "_" + index + "." + extension;
        fotos.push(name);
        fs.rename(file.filepath, "public/images/" + name, async function (err) {
          if (err) {
            res.status(400);
            console.log(err);
            return res.json({
              msg: "Error",
              tag: "No se pudo guardar el archivo",
              code: 400,
            });
          }
        });
      }

      const variasFoto = fotos.join(",");
      await auto.update(
        { foto: variasFoto },
        { where: { external_id: externalAuto } }
      );

      res.status(200);
      res.json({ msg: "OK", tag: "Imágenes guardadas", code: 200 });
    });
  }
}
module.exports = AutoControl;
