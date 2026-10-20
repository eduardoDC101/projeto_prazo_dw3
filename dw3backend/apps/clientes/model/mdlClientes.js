const db = require("../../../database/databaseconfig");

const GetAllClientes = async () => {
  return (
    await db.query(
      "SELECT * FROM clientes WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetClienteByID = async (clienteIDPar) => {
  return (
    await db.query(
      "SELECT * FROM clientes WHERE id = $1 AND removido = false",
      [clienteIDPar]
    )
  ).rows;
};

const InsertCliente = async (clienteREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO clientes (nome, email, telefone, removido) " +
          "VALUES ($1, $2, $3, false)",
        [clienteREGPar.nome, clienteREGPar.email, clienteREGPar.telefone]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlClientes|InsertCliente]", error.detail || error.message);
    msg = error.code === "23505" ? "E-mail já cadastrado." : "Não foi possível inserir o cliente.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateCliente = async (clienteIDPar, clienteREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE clientes SET nome = $2, email = $3, telefone = $4 " +
          "WHERE id = $1 AND removido = false",
        [
          clienteIDPar,
          clienteREGPar.nome,
          clienteREGPar.email,
          clienteREGPar.telefone,
        ]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlClientes|UpdateCliente]", error.detail || error.message);
    msg = error.code === "23505" ? "E-mail já cadastrado." : "Não foi possível atualizar o cliente.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteCliente = async (clienteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE clientes SET removido = true WHERE id = $1 AND removido = false",
        [clienteIDPar]
      )
    ).rowCount;
  } catch (error) {
    console.error("[mdlClientes|DeleteCliente]", error.detail || error.message);
    msg = "Não foi possível remover o cliente.";
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllClientes,
  GetClienteByID,
  InsertCliente,
  UpdateCliente,
  DeleteCliente,
};
