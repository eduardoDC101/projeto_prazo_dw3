var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('clientes/vwLstClientes', {
    title: 'Clientes',
    showNavbar: true,
    activeMenu: 'clientes',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', function(req, res) {
  res.render('clientes/vwFormClientes', {
    title: 'Formulário de clientes',
    showNavbar: true,
    activeMenu: 'clientes',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
