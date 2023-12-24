"use strict";

var models = require("../models");
var persona = models.persona;
var rol = models.rol;

class PersonaControl {
  async listar(req, res) {
    var lista = await persona.findAll();
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async crear(req, res) {
    var UUID = require("uuid");
    var rolId = await rol.findOne({
      where: { external_id: req.body.id_rol },
    });

    // Lista de campos permitidos
    const camposPermitidos = [
      "nombres",
      "apellidos",
      "direccion",
      "celular",
      "fecha_nac",
      "correo",
      "clave",
      "id_rol",
    ];

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

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
      let transaction = await models.sequelize.transaction();
      try {
        if (rolId !== undefined && rolId !== null) {
          var result = await persona.create(
            {
              nombres: req.body.nombres,
              apellidos: req.body.apellidos,
              direccion: req.body.direccion,
              celular: req.body.celular,
              fecha_nac: req.body.fecha_nac,
              cuenta: {
                correo: req.body.correo,
                clave: req.body.clave,
              },
              id_rol: rolId.id,
              external_id: UUID.v4(),
            },
            {
              include: [
                {
                  model: models.cuenta,
                  as: "cuenta",
                },
              ],
              transaction,
            }
          );
          await transaction.commit();
          if (result === null) {
            res.status(401);
            res.json({
              msg: "ERROR",
              tag: "NO se pudo crear",
              code: 401,
            });
          } else {
            rolId.external_id = UUID.v4();
            await rolId.save();
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
            tag: "No se encuentra Rol",
            code: 401,
          });
        }
      } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(203);
        res.json({
          msg: "ERROR",
          tag: "la cuenta ya existe",
          code: 401,
          error_msg: error,
        });
      }
    }
  }

  async update(req, res) {
    const external = req.params.external;
    var rolId = await rol.findOne({
    where: { id: req.body.id_rol },
    });
    var lista = await persona.findOne({
      where: { external_id: external },
     /* attributes: [
        "nombres",
        "apellidos",
        "direccion",
        "celular",
        "fecha_nac",
//        "id_rol",
        ],
      */});

    lista.nombres = req.body.nombres;
    lista.apellidos = req.body.apellidos;
    lista.direccion = req.body.direccion;
    lista.celular = req.body.celular;
    lista.fecha_nac = req.body.fecha_nac;
    lista.id_rol = rolId.id;

    await lista.save();

    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista, // Cambié result por lista, ya que result no estaba definido
    });
  }
}
module.exports = PersonaControl;
