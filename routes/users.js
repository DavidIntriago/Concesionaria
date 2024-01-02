var express = require("express");
var router = express.Router();
let jwt = require("jsonwebtoken");

const rol = require("../app/controllers/RolControl");
let rolControl = new rol();

const persona = require("../app/controllers/PersonaControl");
let personaControl = new persona();

const cliente = require("../app/controllers/ClienteControl");
let clienteControl = new cliente();

const auto = require("../app/controllers/AutoControl");
let autoControl = new auto();

const venta = require("../app/controllers/VentaControl");
let ventaControl = new venta();

const cuenta = require("../app/controllers/CuentaControl");
let cuentaControl = new cuenta();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//MIDEWARE
const auth = function middleware(req, res, next) {
  const token = req.headers["token-key"];

  console.log(req.headers);

  if (token === undefined) {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Falta token",
      code: 401,
    });
  } else {
    require("dotenv").config();
    const key = process.env.KEY;
    jwt.verify(token, key, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "Token no valido o expirado",
          code: 401,
        });
      } else {
        req.id = decoded.external;
        console.log("aquio");
        console.log(req.id);
        const models = require("../app/models");
        const cuenta = models.cuenta;
        const aux = await cuenta.findOne({
          where: { external_id: decoded.external },
        });
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "Token no valido",
            code: 401,
          });
        } else {
          next();
        }
      }
    });
  }
  // console.log(req.url);
  // console.log(token);
  // next();
};

const isVendedor = async (req, res, next) => {
  const models = require("../app/models");
  const cuenta = models.cuenta;
  const aux = await cuenta.findOne({
    where: { external_id: req.id },
  });
  const persona = models.persona;
  const personAux = await persona.findOne({
    where: { id: aux.id_persona },
  });
  const rol = models.rol;
  const rolAux = await rol.findOne({
    where: { id: personAux.id_rol },
  });

  if ((rolAux.nombre = "Agente_Vendedor")) {
    next();
  } else {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Debe ser un Agente Vendedor",
      code: 401,
    });
  }

  // console.log(req.url);
  // console.log(token);
  // next();
};

const isGerente = async (req, res, next) => {
  const models = require("../app/models");
  const cuenta = models.cuenta;
  const aux = await cuenta.findOne({
    where: { external_id: req.id },
  });
  const persona = models.persona;
  const personAux = await persona.findOne({
    where: { id: aux.id_persona },
  });
  const rol = models.rol;
  const rolAux = await rol.findOne({
    where: { id: personAux.id_rol },
  });

  if (rolAux.nombre === "Gerente") {
    next();
    return
  } else {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Debe ser un Gerente",
      code: 401,
    });
    return
  }

  // console.log(req.url);
  // console.log(token);
  // next();
};


// ROLLL
router.get("/admin/rol", [auth, isGerente], rolControl.listar);
router.post("/admin/rol/save",[auth, isGerente], rolControl.crear);

// PERSONAAAAA
router.get("/admin/persona", personaControl.listar);
router.post("/admin/persona/save", personaControl.crear);
router.put("/admin/persona/update/:external", [auth, isGerente], personaControl.update);

//CLIENTEEEEEE
router.get("/admin/cliente", auth, clienteControl.listar);
router.post("/admin/cliente/save", [auth, isVendedor], clienteControl.crear);

//AUTOOO
router.get("/autos", autoControl.listar);
router.post("/admin/auto/save", [auth, isGerente],autoControl.crear);
router.put("/admin/auto/update/:external", [auth, isGerente], autoControl.update);
router.post("/admin/auto/update/imagen/:external", [auth, isGerente], autoControl.guardarFoto);
router.get("/admin/infauto/:external", autoControl.obtenerAuto);


//VENTAA
router.get("/admin/venta", [auth, isGerente],ventaControl.listar);
router.post("/admin/venta/save", [auth, isVendedor], ventaControl.crear);
router.put("/admin/venta/update/:external", [auth, isVendedor],ventaControl.update);
router.get("/admin/venta/vendedor/:external", ventaControl.lista_vendedor);
router.get("/admin/venta/:external", ventaControl.obtener);
router.get("/admin/ventaMes/:external", ventaControl.obtenerFecha);


//CUENTAA
router.post("/admin/inicio_sesion", cuentaControl.inicio_sesion);
router.get("/admin/cuenta", [auth, isGerente], cuentaControl.listar);
router.get("/admin/validar", [auth, isGerente], cuentaControl.validarGerente);


module.exports = router;
