const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const base = "http://localhost:40000";
let falhas = 0;

function assert(condicao, nome, extra) {
  if (condicao) {
    console.log("PASS " + nome);
    return;
  }

  falhas += 1;
  console.log("FAIL " + nome + (extra ? " | " + JSON.stringify(extra) : ""));
}

async function req(method, caminho, opcoes) {
  const headers = {};
  const token = opcoes && opcoes.token;
  const body = opcoes && opcoes.body;

  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(base + caminho, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = { parseError: true };
  }

  return { http: response.status, data };
}

async function main() {
  const sufixo = Date.now();
  const email = "cliente." + sufixo + "@example.com";

  const loginRuim = await req("POST", "/Login", {
    body: { username: "admin", password: "errada" },
  });
  assert(loginRuim.http === 200 && !loginRuim.data.token, "login com senha errada não devolve token", loginRuim);

  const semToken = await req("GET", "/getAllClientes");
  assert(semToken.data && semToken.data.auth === false, "GetAllClientes sem token", semToken);

  const tokenRuim = await req("GET", "/getAllServicos", { token: "token-invalido" });
  assert(tokenRuim.data && tokenRuim.data.auth === false, "GetAllServicos com token inválido", tokenRuim);

  const login = await req("POST", "/Login", {
    body: { username: "admin", password: "admin" },
  });
  const token = login.data && login.data.token;
  assert(login.data && login.data.auth === true && !!token, "login admin devolve JWT", login);

  const clientes = await req("GET", "/getAllClientes", { token });
  assert(
    clientes.data && clientes.data.status === "ok" && Array.isArray(clientes.data.registro),
    "GetAllClientes com token",
    clientes.data
  );
  assert(
    clientes.data.registro.every((item) => item.removido === false),
    "GetAllClientes só traz removido = false"
  );
  assert(
    clientes.data.registro.some((item) => item.email === "ana.lima@example.com"),
    "semente Ana Lima aparece na listagem"
  );

  const invalido = await req("POST", "/insertCliente", {
    token,
    body: { nome: "", email: "nao-e-email", telefone: "abc" },
  });
  assert(invalido.data && invalido.data.status !== "ok" && invalido.data.linhasAfetadas === 0, "InsertCliente rejeita dados inválidos", invalido.data);

  const inserido = await req("POST", "/insertCliente", {
    token,
    body: { nome: "Cliente Teste", email: email, telefone: "(17) 90000-0000" },
  });
  assert(inserido.data && inserido.data.status === "ok" && inserido.data.linhasAfetadas === 1, "InsertCliente", inserido.data);

  const lista = await req("GET", "/getAllClientes", { token });
  const cliente = lista.data.registro.find((item) => item.email === email);
  assert(!!cliente && cliente.id > 0, "cliente inserido aparece no GetAll", cliente);

  const porId = await req("GET", "/getClienteByID/" + cliente.id, { token });
  assert(
    porId.data.status === "ok" && porId.data.registro.length === 1 && porId.data.registro[0].nome === "Cliente Teste",
    "GetClienteByID",
    porId.data
  );

  const inexistente = await req("GET", "/getClienteByID/999999", { token });
  assert(
    inexistente.data.status === "ok" && inexistente.data.registro.length === 0,
    "GetClienteByID inexistente devolve lista vazia",
    inexistente.data
  );

  const idInvalido = await req("GET", "/getClienteByID/abc", { token });
  assert(idInvalido.data.status !== "ok", "GetClienteByID com ID inválido", idInvalido.data);

  const atualizado = await req("PUT", "/updateCliente/" + cliente.id, {
    token,
    body: { nome: "Cliente Alterado", email: email, telefone: "" },
  });
  assert(atualizado.data.status === "ok" && atualizado.data.linhasAfetadas === 1, "UpdateCliente", atualizado.data);

  const servicoRuim = await req("POST", "/insertServico", {
    token,
    body: {
      clienteid: 999999,
      titulo: "Sem cliente",
      descricao: "nao grava",
      valor: 10,
      dataentrega: "2026-12-01",
    },
  });
  assert(servicoRuim.data.status === "Cliente inexistente ou removido.", "InsertServico rejeita cliente inexistente", servicoRuim.data);

  const valorRuim = await req("POST", "/insertServico", {
    token,
    body: {
      clienteid: cliente.id,
      titulo: "Valor ruim",
      descricao: "",
      valor: -5,
      dataentrega: "2026-02-31",
    },
  });
  assert(valorRuim.data.status !== "ok", "InsertServico rejeita valor e data inválidos", valorRuim.data);

  const servico = await req("POST", "/insertServico", {
    token,
    body: {
      clienteid: cliente.id,
      titulo: "Entrega teste " + sufixo,
      descricao: "Descrição do teste",
      valor: "1500.50",
      dataentrega: "2026-12-25",
    },
  });
  assert(servico.data.status === "ok" && servico.data.linhasAfetadas === 1, "InsertServico", servico.data);

  const servicos = await req("GET", "/getAllServicos", { token });
  const servicoCriado = servicos.data.registro.find((item) => item.titulo === "Entrega teste " + sufixo);
  assert(
    !!servicoCriado && servicoCriado.nomecliente === "Cliente Alterado" && String(servicoCriado.valor) === "1500.50",
    "GetAllServicos traz valor, data e nome do cliente",
    servicoCriado
  );
  assert(String(servicoCriado.dataentrega).slice(0, 10) === "2026-12-25", "data de entrega preservada", servicoCriado.dataentrega);

  const servicoPorId = await req("GET", "/getServicoByID/" + servicoCriado.id, { token });
  assert(servicoPorId.data.registro.length === 1, "GetServicoByID", servicoPorId.data);

  const servicoAtualizado = await req("PUT", "/updateServico/" + servicoCriado.id, {
    token,
    body: {
      clienteid: cliente.id,
      titulo: "Entrega revisada " + sufixo,
      descricao: "Texto novo",
      valor: 80,
      dataentrega: "2026-12-31",
    },
  });
  assert(servicoAtualizado.data.status === "ok" && servicoAtualizado.data.linhasAfetadas === 1, "UpdateServico", servicoAtualizado.data);

  const apoio = await req("GET", "/getClientesToServicos", { token });
  assert(
    apoio.data.status === "ok" && apoio.data.registro.some((item) => item.id === cliente.id),
    "getClientesToServicos",
    apoio.data && apoio.data.status
  );

  const apagouServico = await req("DELETE", "/deleteServico/" + servicoCriado.id, { token });
  assert(apagouServico.data.status === "ok" && apagouServico.data.linhasAfetadas === 1, "DeleteServico", apagouServico.data);

  const servicoApagado = await req("GET", "/getServicoByID/" + servicoCriado.id, { token });
  assert(servicoApagado.data.registro.length === 0, "GetServicoByID não retorna removido", servicoApagado.data);

  const listaServicos = await req("GET", "/getAllServicos", { token });
  assert(
    !listaServicos.data.registro.some((item) => item.id === servicoCriado.id),
    "GetAllServicos não lista serviço removido"
  );

  const updateRemovido = await req("PUT", "/updateServico/" + servicoCriado.id, {
    token,
    body: {
      clienteid: cliente.id,
      titulo: "Não pode",
      descricao: "",
      valor: 10,
      dataentrega: "2026-12-31",
    },
  });
  assert(updateRemovido.data.status !== "ok", "UpdateServico de registro removido é recusado", updateRemovido.data);

  const deleteDeNovo = await req("DELETE", "/deleteServico/" + servicoCriado.id, { token });
  assert(deleteDeNovo.data.linhasAfetadas === 0, "DeleteServico repetido não altera outra linha", deleteDeNovo.data);

  const apagouCliente = await req("DELETE", "/deleteCliente/" + cliente.id, { token });
  assert(apagouCliente.data.status === "ok" && apagouCliente.data.linhasAfetadas === 1, "DeleteCliente", apagouCliente.data);

  const clienteApagado = await req("GET", "/getClienteByID/" + cliente.id, { token });
  assert(clienteApagado.data.registro.length === 0, "GetClienteByID não retorna removido", clienteApagado.data);

  const listaFinal = await req("GET", "/getAllClientes", { token });
  assert(!listaFinal.data.registro.some((item) => item.id === cliente.id), "GetAllClientes não lista cliente removido");

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  const linhaCliente = await pool.query("SELECT id, removido FROM clientes WHERE id = $1", [cliente.id]);
  const linhaServico = await pool.query("SELECT id, removido, clienteid FROM servicos WHERE id = $1", [servicoCriado.id]);
  const senha = await pool.query("SELECT password FROM usuarios WHERE username = $1", ["admin"]);

  assert(linhaCliente.rowCount === 1 && linhaCliente.rows[0].removido === true, "cliente removido continua no PostgreSQL", linhaCliente.rows[0]);
  assert(
    linhaServico.rowCount === 1 && linhaServico.rows[0].removido === true && Number(linhaServico.rows[0].clienteid) === cliente.id,
    "serviço removido continua ligado ao cliente",
    linhaServico.rows[0]
  );
  assert(senha.rows[0].password !== "admin" && senha.rows[0].password.startsWith("$2"), "senha do admin não está em texto puro");

  await pool.end();

  if (falhas > 0) {
    console.log("RESULTADO " + falhas + " falha(s)");
    process.exit(1);
  }

  console.log("RESULTADO todos os testes passaram");
}

main().catch((error) => {
  console.error("ERRO", error);
  process.exit(1);
});
