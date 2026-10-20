document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmClientes');

  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var btnInserir = document.getElementById('btnInserirCliente');
  var btnAtualizar = document.getElementById('btnAtualizarCliente');
  var btnRemover = document.getElementById('btnRemoverCliente');
  var titulo = document.getElementById('tituloFormulario');

  if (oper === 'Cr') {
    titulo.textContent = 'Cadastrar cliente';
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertCliente();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Consultar cliente';
    definirSomenteLeitura(true);
    await vwGetClienteByID();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Atualizar cliente';
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetClienteByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdateCliente();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover cliente';
    btnRemover.classList.remove('d-none');
    definirSomenteLeitura(true);
    btnRemover.disabled = !(await vwGetClienteByID());
    btnRemover.addEventListener('click', function() {
      vwDeleteCliente();
    });
  }
});

function definirSomenteLeitura(ativo) {
  ['nome', 'email', 'telefone'].forEach(function(campoId) {
    document.getElementById(campoId).disabled = ativo;
  });
}

function mostrarId(valor) {
  document.getElementById('grupoId').classList.remove('d-none');
  document.getElementById('id').value = valor;
  document.getElementById('idVisivel').value = valor;
}

function montarClienteDoFormulario() {
  return {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    removido: false
  };
}

function lerIdDaUrl() {
  var clienteId = new URLSearchParams(window.location.search).get('id');

  if (!clienteId || !/^\d+$/.test(clienteId) || Number(clienteId) <= 0) {
    throw new Error('ID do cliente inválido.');
  }

  return clienteId;
}

async function vwInsertCliente() {
  var form = document.getElementById('frmClientes');
  var btnInserir = document.getElementById('btnInserirCliente');

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertCliente', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarClienteDoFormulario())
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o cliente.');
    }

    alert('Cliente cadastrado com sucesso.');
    window.location.href = '/clientes';
  } catch (error) {
    alert(error.message || 'Erro ao inserir cliente.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwGetClienteByID() {
  var form = document.getElementById('frmClientes');

  try {
    var clienteId = lerIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getClienteByID/' + encodeURIComponent(clienteId), {
      headers: dw3MontarHeadersAutenticacao()
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error(data.status || 'Resposta inválida do servidor backend.');
    }

    var cliente = data.registro[0];

    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    mostrarId(cliente.id);
    document.getElementById('nome').value = cliente.nome ?? '';
    document.getElementById('email').value = cliente.email ?? '';
    document.getElementById('telefone').value = cliente.telefone ?? '';
    document.getElementById('removido').value = String(cliente.removido === true);
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar cliente.');
    return false;
  }
}

async function vwUpdateCliente() {
  var form = document.getElementById('frmClientes');
  var btnAtualizar = document.getElementById('btnAtualizarCliente');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var clienteId = lerIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updateCliente/' + encodeURIComponent(clienteId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarClienteDoFormulario())
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o cliente.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum cliente foi atualizado.');
    }

    alert('Cliente atualizado com sucesso.');
  } catch (error) {
    alert(error.message || 'Erro ao atualizar cliente.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteCliente() {
  var form = document.getElementById('frmClientes');
  var btnRemover = document.getElementById('btnRemoverCliente');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste cliente? O registro permanece no banco, apenas marcado como removido.')) {
    return;
  }

  try {
    var clienteId = document.getElementById('id').value;
    var servidorDw3 = form.dataset.servidorDw3;

    if (!clienteId || !/^\d+$/.test(clienteId) || Number(clienteId) <= 0) {
      throw new Error('ID do cliente inválido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deleteCliente/' + encodeURIComponent(clienteId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o cliente.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum cliente foi removido.');
    }

    alert('Cliente removido.');
    window.location.href = '/clientes';
  } catch (error) {
    alert(error.message || 'Erro ao remover cliente.');
    btnRemover.disabled = false;
  }
}
