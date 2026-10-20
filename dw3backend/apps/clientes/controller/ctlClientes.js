const mdlClientes = require("../model/mdlClientes");

function lerID(valor) {
  if (!/^\d+$/.test(String(valor || ""))) {
    return null;
  }

  const id = parseInt(valor, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function validarCliente(registro) {
  registro.nome = String(registro.nome || "").trim();
  registro.email = String(registro.email || "").trim().toLowerCase();
  registro.telefone = String(registro.telefone || "").trim();

  if (!registro.nome || registro.nome.length > 100) {
    return "Informe o nome do cliente com até 100 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registro.email) || registro.email.length > 120) {
    return "Informe um e-mail válido.";
  }

  if (registro.telefone && (registro.telefone.length > 20 || !/^[0-9 ()+-]+$/.test(registro.telefone))) {
    return "Informe um telefone válido ou deixe o campo vazio.";
  }

  if (!registro.telefone) {
    registro.telefone = null;
  }

  return "";
}

function concluirEscrita(res, resultado, mensagemVazia) {
  let msg = resultado.msg;
  if (msg === "ok" && resultado.linhasAfetadas === 0) {
    msg = mensagemVazia;
  }

  res.json({ status: msg, linhasAfetadas: resultado.linhasAfetadas });
}

const GetAllClientes = (req, res) =>
  (async () => {
    try {
      let registro = await mdlClientes.GetAllClientes();
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      console.error("[ctlClientes|GetAllClientes]", error.message);
      res.json({ status: "Não foi possível consultar os clientes.", registro: [] });
    }
  })();

const GetClienteByID = (req, res) =>
  (async () => {
    try {
      const clienteID = lerID(req.params.id);
      if (!clienteID) {
        return res.json({ status: "ID inválido.", registro: [] });
      }

      let registro = await mdlClientes.GetClienteByID(clienteID);
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      console.error("[ctlClientes|GetClienteByID]", error.message);
      res.json({ status: "Não foi possível consultar o cliente.", registro: [] });
    }
  })();

const InsertCliente = (request, res) =>
  (async () => {
    try {
      const clienteREG = request.body || {};
      const erro = validarCliente(clienteREG);
      if (erro) {
        return res.json({ status: erro, linhasAfetadas: 0 });
      }

      let resultado = await mdlClientes.InsertCliente(clienteREG);
      res.json({ status: resultado.msg, linhasAfetadas: resultado.linhasAfetadas });
    } catch (error) {
      console.error("[ctlClientes|InsertCliente]", error.message);
      res.json({ status: "Não foi possível inserir o cliente.", linhasAfetadas: -1 });
    }
  })();

const UpdateCliente = (request, res) =>
  (async () => {
    try {
      const clienteID = lerID(request.params.id);
      if (!clienteID) {
        return res.json({ status: "ID inválido.", linhasAfetadas: 0 });
      }

      const clienteREG = request.body || {};
      const erro = validarCliente(clienteREG);
      if (erro) {
        return res.json({ status: erro, linhasAfetadas: 0 });
      }

      let resultado = await mdlClientes.UpdateCliente(clienteID, clienteREG);
      concluirEscrita(res, resultado, "Registro não encontrado ou já removido.");
    } catch (error) {
      console.error("[ctlClientes|UpdateCliente]", error.message);
      res.json({ status: "Não foi possível atualizar o cliente.", linhasAfetadas: -1 });
    }
  })();

const DeleteCliente = (request, res) =>
  (async () => {
    try {
      const clienteID = lerID(request.params.id);
      if (!clienteID) {
        return res.json({ status: "ID inválido.", linhasAfetadas: 0 });
      }

      let resultado = await mdlClientes.DeleteCliente(clienteID);
      concluirEscrita(res, resultado, "Registro não encontrado ou já removido.");
    } catch (error) {
      console.error("[ctlClientes|DeleteCliente]", error.message);
      res.json({ status: "Não foi possível remover o cliente.", linhasAfetadas: -1 });
    }
  })();

module.exports = {
  GetAllClientes,
  GetClienteByID,
  InsertCliente,
  UpdateCliente,
  DeleteCliente,
};
