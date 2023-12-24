"use strict";

var models = require("../models");
var venta = models.venta;
var cliente = models.cliente;
var vendedor = models.persona;
var auto = models.auto;

class VentaControl {
  async listar(req, res) {
    var lista = await venta.findAll();
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async crear(req, res) {
    var UUID = require("uuid");
    var clienteId = await cliente.findOne({
      where: { external_id: req.body.id_cliente },
    });

    var autoId = await auto.findOne({
      where: { external_id: req.body.id_auto },
    });

    var vendedorId = await vendedor.findOne({
      where: { external_id: req.body.id_vendedor },
    });

    // Lista de campos permitidos
    const camposPermitidos = ["fecha", "id_auto", "id_cliente", "id_vendedor"];

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
      if (autoId.estado == false) {
        if (autoId.color == "Blanco" || autoId.color == "Plata") {
          var result = await venta.create({
            fecha: req.body.modelo,
            id_auto: autoId.id,
            id_cliente: clienteId.id,
            id_vendedor: vendedorId.id,
            precio: autoId.precio,
            external_id: UUID.v4(),
          });
        } else {
          var result = await venta.create({
            fecha: req.body.modelo,
            id_auto: autoId.id,
            id_cliente: clienteId.id,
            id_vendedor: vendedorId.id,
            precio: autoId.precio,
            external_id: UUID.v4(),
          });
        }

        autoId.estado = true;
        await autoId.save();

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
      } else {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "El auto se encuentra vendido",
          code: 401,
        });
      }
    }
  }
}
module.exports = VentaControl;
