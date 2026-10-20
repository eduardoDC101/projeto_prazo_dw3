const mdlServicos = require("../model/mdlServicos");

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

function validarServico(registro) {
  registro.titulo = String(registro.titulo || "").trim();
  registro.descricao = String(registro.descricao || "").trim();
  registro.clienteid = lerID(registro.clienteid);

  if (!registro.clienteid) {
    return "Selecione um cliente.";
  }

  if (!registro.titulo || registro.titulo.length > 120) {
    return "Informe o título do serviço com até 120 caracteres.";
  }

  if (registro.descricao.length > 500) {
    return "A descrição deve ter até 500 caracteres.";
  }

  if (!registro.descricao) {
    registro.descricao = null;
  }

  const valorTexto = String(registro.valor === undefined || registro.valor === null ? "" : registro.valor)
    .trim()
    .replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(valorTexto)) {
    return "Informe um valor decimal válido, maior ou igual a zero, com até duas casas.";
  }

  registro.valor = valorTexto;

  const data = String(registro.dataentrega || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return "Informe a data de vencimento.";
  }

  const partes = data.split("-").map((parte) => parseInt(parte, 10));
  const conferida = new Date(partes[0], partes[1] - 1, partes[2]);
  if (
    conferida.getFullYear() !== partes[0] ||
    conferida.getMonth() !== partes[1] - 1 ||
    conferida.getDate() !== partes[2]
  ) {
    return "Informe uma data de vencimento válida.";
  }

  registro.dataentrega = data;
  return "";
}

function concluirEscrita(res, resultado, mensagemVazia) {
  let msg = resultado.msg;
  if (msg === "ok" && resultado.linhasAfetadas === 0) {
    msg = mensagemVazia;
  }

  res.json({ status: msg, linhasAfetadas: resultado.linhasAfetadas });
}

const GetAllServicos = (req, res) =>
  (async () => {
    try {
      let registro = await mdlServicos.GetAllServicos();
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      console.error("[ctlServicos|GetAllServicos]", error.message);
      res.json({ status: "Não foi possível consultar os serviços.", registro: [] });
    }
  })();

const GetServicoByID = (req, res) =>
  (async () => {
    try {
      const servicoID = lerID(req.params.id);
      if (!servicoID) {
        return res.json({ status: "ID inválido.", registro: [] });
      }

      let registro = await mdlServicos.GetServicoByID(servicoID);
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      console.error("[ctlServicos|GetServicoByID]", error.message);
      res.json({ status: "Não foi possível consultar o serviço.", registro: [] });
    }
  })();

const GetClientesToServicos = (req, res) =>
  (async () => {
    try {
      let registro = await mdlServicos.GetClientesToServicos();
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      console.error("[ctlServicos|GetClientesToServicos]", error.message);
      res.json({ status: "Não foi possível consultar os clientes.", registro: [] });
    }
  })();

const InsertServico = (request, res) =>
  (async () => {
    try {
      const servicoREG = request.body || {};
      const erro = validarServico(servicoREG);
      if (erro) {
        return res.json({ status: erro, linhasAfetadas: 0 });
      }

      let resultado = await mdlServicos.InsertServico(servicoREG);
      res.json({ status: resultado.msg, linhasAfetadas: resultado.linhasAfetadas });
    } catch (error) {
      console.error("[ctlServicos|InsertServico]", error.message);
      res.json({ status: "Não foi possível inserir o serviço.", linhasAfetadas: -1 });
    }
  })();

const UpdateServico = (request, res) =>
  (async () => {
    try {
      const servicoID = lerID(request.params.id);
      if (!servicoID) {
        return res.json({ status: "ID inválido.", linhasAfetadas: 0 });
      }

      const servicoREG = request.body || {};
      const erro = validarServico(servicoREG);
      if (erro) {
        return res.json({ status: erro, linhasAfetadas: 0 });
      }

      let resultado = await mdlServicos.UpdateServico(servicoID, servicoREG);
      concluirEscrita(res, resultado, "Registro não encontrado ou já removido.");
    } catch (error) {
      console.error("[ctlServicos|UpdateServico]", error.message);
      res.json({ status: "Não foi possível atualizar o serviço.", linhasAfetadas: -1 });
    }
  })();

const DeleteServico = (request, res) =>
  (async () => {
    try {
      const servicoID = lerID(request.params.id);
      if (!servicoID) {
        return res.json({ status: "ID inválido.", linhasAfetadas: 0 });
      }

      let resultado = await mdlServicos.DeleteServico(servicoID);
      concluirEscrita(res, resultado, "Registro não encontrado ou já removido.");
    } catch (error) {
      console.error("[ctlServicos|DeleteServico]", error.message);
      res.json({ status: "Não foi possível remover o serviço.", linhasAfetadas: -1 });
    }
  })();

module.exports = {
  GetAllServicos,
  GetServicoByID,
  GetClientesToServicos,
  InsertServico,
  UpdateServico,
  DeleteServico,
};
