document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmServicos');

  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var servidorDw3 = form.dataset.servidorDw3;
  var btnInserir = document.getElementById('btnInserirServico');
  var btnAtualizar = document.getElementById('btnAtualizarServico');
  var btnRemover = document.getElementById('btnRemoverServico');
  var titulo = document.getElementById('tituloFormulario');

  inicializarSelectClientes();

  if (oper === 'Cr') {
    titulo.textContent = 'Cadastrar serviço';
    btnInserir.classList.remove('d-none');
    await vwGetClientesToServicos(servidorDw3);
    btnInserir.addEventListener('click', function() {
      vwInsertServico();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Consultar serviço';
    definirSomenteLeitura(true);
    await vwGetServicoByID();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Atualizar serviço';
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetServicoByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdateServico();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover serviço';
    btnRemover.classList.remove('d-none');
    definirSomenteLeitura(true);
    btnRemover.disabled = !(await vwGetServicoByID());
    btnRemover.addEventListener('click', function() {
      vwDeleteServico();
    });
  }
});

function inicializarSelectClientes() {
  $('#clienteid').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um cliente',
    width: '100%'
  });
}

function definirSomenteLeitura(ativo) {
  ['titulo', 'descricao', 'valor', 'dataentrega'].forEach(function(campoId) {
    document.getElementById(campoId).disabled = ativo;
  });
  $('#clienteid').prop('disabled', ativo);
}

function mostrarId(valor) {
  document.getElementById('grupoId').classList.remove('d-none');
  document.getElementById('id').value = valor;
  document.getElementById('idVisivel').value = valor;
}

function montarServicoDoFormulario() {
  return {
    clienteid: document.getElementById('clienteid').value,
    titulo: document.getElementById('titulo').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    valor: document.getElementById('valor').value,
    dataentrega: document.getElementById('dataentrega').value,
    removido: false
  };
}

function lerIdDaUrl() {
  var servicoId = new URLSearchParams(window.location.search).get('id');

  if (!servicoId || !/^\d+$/.test(servicoId) || Number(servicoId) <= 0) {
    throw new Error('ID do serviço inválido.');
  }

  return servicoId;
}

async function vwGetClientesToServicos(servidorDw3) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getClientesToServicos', {
      headers: dw3MontarHeadersAutenticacao()
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error(data.status || 'Resposta inválida do servidor backend.');
    }

    preencherSelectClientes(data.registro);
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar clientes.');
    return false;
  }
}

function preencherSelectClientes(clientes) {
  var clienteSelect = document.getElementById('clienteid');
  clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';

  clientes.forEach(function(cliente) {
    var option = document.createElement('option');
    option.value = cliente.id;
    option.textContent = cliente.nome;
    clienteSelect.appendChild(option);
  });

  $('#clienteid').trigger('change');
}

async function vwInsertServico() {
  var form = document.getElementById('frmServicos');
  var btnInserir = document.getElementById('btnInserirServico');

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertServico', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarServicoDoFormulario())
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o serviço.');
    }

    alert('Serviço cadastrado com sucesso.');
    window.location.href = '/servicos';
  } catch (error) {
    alert(error.message || 'Erro ao inserir serviço.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwGetServicoByID() {
  var form = document.getElementById('frmServicos');

  try {
    var servicoId = lerIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getServicoByID/' + encodeURIComponent(servicoId), {
      headers: dw3MontarHeadersAutenticacao()
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error(data.status || 'Resposta inválida do servidor backend.');
    }

    var servico = data.registro[0];

    if (!servico) {
      throw new Error('Serviço não encontrado.');
    }

    if (!(await vwGetClientesToServicos(servidorDw3))) {
      return false;
    }

    var clienteSelect = document.getElementById('clienteid');
    var clienteJaListado = Array.from(clienteSelect.options).some(function(opcao) {
      return opcao.value === String(servico.clienteid);
    });

    if (!clienteJaListado) {
      var option = document.createElement('option');
      option.value = servico.clienteid;
      option.textContent = servico.nomecliente || ('Cliente ' + servico.clienteid);
      clienteSelect.appendChild(option);
    }

    mostrarId(servico.id);
    document.getElementById('titulo').value = servico.titulo ?? '';
    document.getElementById('descricao').value = servico.descricao ?? '';
    document.getElementById('valor').value = servico.valor ?? '';
    document.getElementById('dataentrega').value = servico.dataentrega ? String(servico.dataentrega).slice(0, 10) : '';
    document.getElementById('removido').value = String(servico.removido === true);
    $('#clienteid').val(String(servico.clienteid)).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar serviço.');
    return false;
  }
}

async function vwUpdateServico() {
  var form = document.getElementById('frmServicos');
  var btnAtualizar = document.getElementById('btnAtualizarServico');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var servicoId = lerIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updateServico/' + encodeURIComponent(servicoId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarServicoDoFormulario())
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o serviço.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum serviço foi atualizado.');
    }

    alert('Serviço atualizado com sucesso.');
  } catch (error) {
    alert(error.message || 'Erro ao atualizar serviço.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteServico() {
  var form = document.getElementById('frmServicos');
  var btnRemover = document.getElementById('btnRemoverServico');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste serviço? O registro permanece no banco, apenas marcado como removido.')) {
    return;
  }

  try {
    var servicoId = document.getElementById('id').value;
    var servidorDw3 = form.dataset.servidorDw3;

    if (!servicoId || !/^\d+$/.test(servicoId) || Number(servicoId) <= 0) {
      throw new Error('ID do serviço inválido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deleteServico/' + encodeURIComponent(servicoId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });
    var data = await response.json();

    if (!dw3TratarRespostaAutenticacao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o serviço.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum serviço foi removido.');
    }

    alert('Serviço removido.');
    window.location.href = '/servicos';
  } catch (error) {
    alert(error.message || 'Erro ao remover serviço.');
    btnRemover.disabled = false;
  }
}
