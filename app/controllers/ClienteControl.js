"use strict";

var models = require("../models");
var cliente = models.cliente;


class ClienteControl {
  async listar(req, res) {
    var lista = await cliente.findAll({
      // para limitar lo que va a listar, envia loss atributos y con esto[cambia de nombre]
      attributes: ["nombres", "apellidos", "direccion", "celular", ["external_id", "id"]],
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
    const camposPermitidos = [
        "nombres",
        "apellidos",
        "direccion",
        "celular",
        "fecha_nac"
      ];
  

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    //console.log(req.body)
    //console.log(camposInvalidos)

    console.log(camposEnviados)
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
      var result = await cliente.create({
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        direccion: req.body.direccion,
        celular: req.body.celular,
        fecha_nac: req.body.fecha_nac,
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

}
module.exports = ClienteControl;
