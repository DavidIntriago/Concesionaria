"use strict";

var models = require("../models");
var venta = models.venta;
var cliente = models.cliente;
var vendedor = models.persona;
var auto = models.auto;
const { Op, Sequelize } = require("sequelize");


class VentaControl {
  async listar(req, res) {
    var lista = await venta.findAll({
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres"],
        
        },{
          model: models.cliente,
          as: "cliente",
          attributes: ["apellidos", "nombres", "direccion", "celular"],
        },{
          model: models.auto,
          as: "auto",
          attributes: ["modelo", "marca", "color", "anio", "foto", "precio"]
        }
      ],
      attributes: ["fecha", "precio", "recargo", "porcentajeIva",["external_id", "id"]],

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
            fecha: req.body.fecha,
            id_auto: autoId.id,
            id_cliente: clienteId.id,
            id_vendedor: vendedorId.id,
            precio : (autoId.precio + autoId.precio * 0.14),
            external_id: UUID.v4(),
          });
        } else {
          var result = await venta.create({
            fecha: req.body.fecha,
            id_auto: autoId.id,
            id_cliente: clienteId.id,
            id_vendedor: vendedorId.id,
            precio : ((autoId.precio)+(autoId.precio * 0.14)) + (autoId.precio * 0.1),
            recargo : true,
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

  async update(req, res) {
    const external = req.params.external;
    //console.log("Tienes externas: " + external);

    var lista = await venta.findOne({
      where: { external_id: external },
    });

    var clienteId = await cliente.findOne({
      where: { external_id: req.body.id_cliente },
    });

    var autoId = await auto.findOne({
      where: { external_id: req.body.id_auto },
    });

    //console.log("Tienes venta: " + lista);

    // Lista de campos permitidos
    const camposPermitidos = ["fecha", "id_auto", "id_cliente"];

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
      var primerAuto = await auto.findOne({
        where: { id: lista.id_auto },
      });
      console.log(primerAuto);
      if (autoId.estado == false) {
        if (autoId.color === "Blanco" || autoId.color === "Plata") {
          lista.fecha = req.body.fecha;
          lista.id_auto = autoId.id;
          lista.id_cliente = clienteId.id;
          lista.precio = autoId.precio;
          lista.recargo=false;
          await lista.save();
        } else {
          lista.fecha = req.body.fecha;
          lista.id_auto = autoId.id;
          lista.id_cliente = clienteId.id;
          lista.precio = (autoId.precio)+(autoId.precio*0.1);
          lista.recargo = true;
          await lista.save();
        }
        if (primerAuto.external_id != autoId.external_id) {
          primerAuto.estado = false;
          await primerAuto.save();
          autoId.estado=true;
          await autoId.save();
          //console.log("fguardo cambio nuevo");
        }

        if (lista === null) {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "NO se pudo actualizar",
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

  async obtener(req, res) {
    const external = req.params.external;
    var lista = await venta.findOne({
      where: { external_id: external },
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres", "id_rol"],
        },
        {
          model: models.cliente,
          as: "cliente",
          attributes: ["apellidos", "nombres", "direccion", "celular", ["external_id", "id"]],
        },
        {
          model: models.auto,
          as: "auto",
          attributes: ["modelo", "marca", "anio", "color", "foto", ["external_id", "id"], "precio"],
        }
      ],
      // para limitar lo que va a listar, envia loss atributos y con esto[cambia de nombre]
      attributes: ["fecha", ["external_id", "id"], "precio", "recargo", "porcentajeIva", ],
    });
    if (lista === undefined || lista === null) {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        data: {},
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

  async lista_vendedor(req, res) {
    const external_vendedor=req.params.external;

    var vendedorId = await vendedor.findOne({
      where: { external_id: external_vendedor },
    });

    var lista = await venta.findAll({
      where: {id_vendedor: vendedorId.id},
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres"],
        
        },{
          model: models.cliente,
          as: "cliente",
          attributes: ["apellidos", "nombres", "direccion", "celular"],
        },{
          model: models.auto,
          as: "auto",
          attributes: ["modelo", "marca", "color", "anio", "foto", "precio"]
        }
      ],
      attributes: ["fecha", "precio", "recargo", "porcentajeIva",["external_id", "id"]],

    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async obtenerFecha(req, res) {
    const mes=req.params.external;

    var lista = await venta.findAll({
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('fecha')), '=', mes),
        ]
      },
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres"],
        
        },{
          model: models.cliente,
          as: "cliente",
          attributes: ["apellidos", "nombres", "direccion", "celular"],
        },{
          model: models.auto,
          as: "auto",
          attributes: ["modelo", "marca", "color", "anio", "foto", "precio"]
        }
      ],
      attributes: ["fecha", "precio", "recargo", "porcentajeIva",["external_id", "id"]],

    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }
}


module.exports = VentaControl;
