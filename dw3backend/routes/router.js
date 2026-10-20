const express = require("express");
const routerApp = express.Router();

const appClientes = require("../apps/clientes/controller/ctlClientes");
const appServicos = require("../apps/servicos/controller/ctlServicos");
const appLogin = require("../apps/login/controller/ctlLogin");

routerApp.use((req, res, next) => {
  next();
});

routerApp.get("/", (req, res) => {
  res.send("Prazo API");
});

routerApp.get("/getAllClientes", appLogin.AutenticaJWT, appClientes.GetAllClientes);
routerApp.get("/getClienteByID/:id", appLogin.AutenticaJWT, appClientes.GetClienteByID);
routerApp.post("/insertCliente", appLogin.AutenticaJWT, appClientes.InsertCliente);
routerApp.put("/updateCliente/:id", appLogin.AutenticaJWT, appClientes.UpdateCliente);
routerApp.delete("/deleteCliente/:id", appLogin.AutenticaJWT, appClientes.DeleteCliente);

routerApp.get("/getAllServicos", appLogin.AutenticaJWT, appServicos.GetAllServicos);
routerApp.get("/getServicoByID/:id", appLogin.AutenticaJWT, appServicos.GetServicoByID);
routerApp.get("/getClientesToServicos", appLogin.AutenticaJWT, appServicos.GetClientesToServicos);
routerApp.post("/insertServico", appLogin.AutenticaJWT, appServicos.InsertServico);
routerApp.put("/updateServico/:id", appLogin.AutenticaJWT, appServicos.UpdateServico);
routerApp.delete("/deleteServico/:id", appLogin.AutenticaJWT, appServicos.DeleteServico);

routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

module.exports = routerApp;
