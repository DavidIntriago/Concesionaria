var express = require('express');
var router = express.Router();

const rol= require('../app/controllers/RolControl')
let rolControl=new rol();

const persona=require('../app/controllers/PersonaControl')
let personaControl=new persona();

const cliente=require('../app/controllers/ClienteControl')
let clienteControl=new cliente();

const auto=require('../app/controllers/AutoControl')
let autoControl=new auto();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// ROLLL
router.get('/admin/rol', rolControl.listar);
router.post('/admin/rol/save', rolControl.crear);

// PERSONAAAAA
router.get('/admin/persona', personaControl.listar);
router.post('/admin/persona/save', personaControl.crear);
router.put('/admin/persona/update/:external', personaControl.update);

//CLIENTEEEEEE  
router.get('/admin/cliente', clienteControl.listar);
router.post('/admin/cliente/save', clienteControl.crear);

//CLIENTEEEEEE  
router.get('/admin/cliente', clienteControl.listar);
router.post('/admin/cliente/save', clienteControl.crear);

//AUTOOO  
router.get('/admin/auto', autoControl.listar);
router.post('/admin/auto/save', autoControl.crear);

module.exports = router;
