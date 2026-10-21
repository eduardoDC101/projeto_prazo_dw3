# Prazo

Módulo financeiro de um ERP de controle de cooperativas, feito para a matéria de Desenvolvimento Web III. O sistema cadastra clientes e as contas a receber pelos serviços prestados a eles.

O front-end e o back-end são dois processos Express. Somente o back-end acessa o PostgreSQL. A organização segue o exemplo da disciplina: CommonJS, Nunjucks, models, controllers, rotas nomeadas e respostas.

## O que o sistema guarda:

- `clientes`: `id`, `nome`, `email`, `telefone`, `removido`.
- `servicos`: `id`, `clienteid`, `titulo`, `descricao`, `valor numeric(12,2)`, `dataentrega`, `removido`.
- `servicos` funciona como a tabela de contas a receber: cada registro é um serviço prestado a um cliente, com o valor a receber (`valor`) e a data de vencimento (`dataentrega`).
- Um cliente pode ter várias contas a receber (relação 1:N).
- `usuarios` serve só para o login. Não é uma das duas tabelas do CRUD.

A exclusão muda `removido` para `true`. A linha continua no banco. Um cliente só pode ser removido depois que todos os seus serviços forem removidos.

## Pré-requisitos

- Node.js 18 ou superior.
- PostgreSQL em execução.

## Configuração

No PowerShell, a partir da pasta `projeto_prazo_dw3`:

```powershell
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$env:PGCLIENTENCODING = "UTF8"
& $psql -h localhost -U postgres -d postgres -c "CREATE DATABASE prazo;"
& $psql -h localhost -U postgres -d prazo -f ".\dw3backend\database\databaseConfig.sql"
```

Copie os exemplos de ambiente e preencha a senha do PostgreSQL e o segredo do JWT:

```powershell
Copy-Item .\dw3backend\.env.example .\dw3backend\.env
Copy-Item .\dw3frontend\dw3frontend.env.example .\dw3frontend\dw3frontend.env
```

Variáveis do back-end: `PORT`, `SECRET_API`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`.

Variável do front-end: `SERVIDOR_DW3=http://localhost:40000`.

## Execução

Abra dois terminais.

```powershell
cd .\dw3backend
npm install
npm start
```

```powershell
cd .\dw3frontend
npm install
npm start
```

- API: http://localhost:40000
- Telas: http://localhost:40100

## Testes

Com o back-end no ar:

```powershell
cd .\dw3backend
node tests\testarApis.js
```

Os arquivos `.rest`, para o REST Client do VS Code, estão em:

- `dw3backend/apps/login/tests/testLogin.rest`
- `dw3backend/apps/clientes/tests/testClientes.rest`
- `dw3backend/apps/servicos/tests/testServicos.rest`

Execute primeiro o pedido nomeado `loginAutenticado`. Os demais usam o token dessa resposta. Alguns pedidos de exclusão alteram os dados de exemplo.
