const db = require("../../../database/databaseconfig");

const GetAllServicos = async () => {
  return (
    await db.query(
      "SELECT servicos.*, " +
        "(SELECT nome FROM clientes WHERE clientes.id = servicos.clienteid) AS nomecliente " +
        "FROM servicos WHERE servicos.removido = false " +
        "ORDER BY dataentrega ASC, titulo ASC"
    )
  ).rows;
};

const GetServicoByID = async (servicoIDPar) => {
  return (
    await db.query(
      "SELECT servicos.*, " +
        "(SELECT nome FROM clientes WHERE clientes.id = servicos.clienteid) AS nomecliente " +
        "FROM servicos WHERE id = $1 AND removido = false",
      [servicoIDPar]
    )
  ).rows;
};

const GetClientesToServicos = async () => {
  return (
    await db.query(
      "SELECT id, nome FROM clientes WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

async function clienteAtivo(clienteIDPar) {
  const consulta = await db.query(
    "SELECT id FROM clientes WHERE id = $1 AND removido = false",
    [clienteIDPar]
  );
  return consulta.rowCount > 0;
}

const InsertServico = async (servicoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    if (!(await clienteAtivo(servicoREGPar.clienteid))) {
      return { msg: "Cliente inexistente ou removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "INSERT INTO servicos (clienteid, titulo, descricao, valor, dataentrega, removido) " +
          "VALUES ($1, $2, $3, $4, $5, false)",
        [
          servicoREGPar.clienteid,
          servicoREGPar.titulo,
          servicoREGPar.descricao,
          servicoREGPar.valor,
          servicoREGPar.dataentrega,
        ]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlServicos|InsertServico]", error.detail || error.message);
    msg = "Não foi possível inserir o serviço.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateServico = async (servicoIDPar, servicoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    if (!(await clienteAtivo(servicoREGPar.clienteid))) {
      return { msg: "Cliente inexistente ou removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE servicos SET clienteid = $2, titulo = $3, descricao = $4, " +
          "valor = $5, dataentrega = $6 " +
          "WHERE id = $1 AND removido = false",
        [
          servicoIDPar,
          servicoREGPar.clienteid,
          servicoREGPar.titulo,
          servicoREGPar.descricao,
          servicoREGPar.valor,
          servicoREGPar.dataentrega,
        ]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlServicos|UpdateServico]", error.detail || error.message);
    msg = "Não foi possível atualizar o serviço.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteServico = async (servicoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE servicos SET removido = true WHERE id = $1 AND removido = false",
        [servicoIDPar]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlServicos|DeleteServico]", error.detail || error.message);
    msg = "Não foi possível remover o serviço.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllServicos,
  GetServicoByID,
  GetClientesToServicos,
  InsertServico,
  UpdateServico,
  DeleteServico,
};
