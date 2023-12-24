"use strict";

var models = require("../models");
var auto = models.auto;

class AutoControl {
  async listar(req, res) {
    var lista = await auto.findAll();
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
      "modelo",
      "marca",
      "anio",
      "color",
      "precio"
    ];

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
    var external=req.params.external;
    var lista= await auto.findOne({
      where: { external_id: external }
    })
    
    // Lista de campos permitidos
    const camposPermitidos = [
      "modelo",
      "marca",
      "anio",
      "color",
      "precio"
    ];

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
       
        lista.modelo=req.body.modelo;
        lista.marca= req.body.marca;
        lista.anio= req.body.anio;
        lista.color= req.body.color;
        lista.precio= req.body.precio;
        await lista.save()
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
}
module.exports = AutoControl;
