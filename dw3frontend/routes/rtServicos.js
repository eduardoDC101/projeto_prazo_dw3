var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('servicos/vwLstServicos', {
    title: 'Contas a receber',
    showNavbar: true,
    activeMenu: 'servicos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', function(req, res) {
  res.render('servicos/vwFormServicos', {
    title: 'Formulário de serviços',
    showNavbar: true,
    activeMenu: 'servicos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
