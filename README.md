# Prazo

Sistema de clientes e serviços para freelancers, feito para o 1º trabalho de Desenvolvimento Web III.

O front-end e o back-end são dois processos Express. Somente o back-end acessa o PostgreSQL. A organização segue o exemplo `dw3backend` / `dw3frontend` da disciplina: CommonJS, Nunjucks, models `mdl`, controllers `ctl`, rotas nomeadas e respostas `{ status, registro }` ou `{ status, linhasAfetadas }`.

## O que o sistema guarda

- `clientes`: `id`, `nome`, `email`, `telefone`, `removido`.
- `servicos`: `id`, `clienteid`, `titulo`, `descricao`, `valor numeric(12,2)`, `dataentrega`, `removido`.
- Um cliente pode ter vários serviços. O valor do serviço é o lançamento financeiro do freelancer.
- `usuarios` serve só para o login. Não é uma das duas tabelas do CRUD.

A exclusão muda `removido` para `true`. A linha continua no banco, e o serviço não é apagado quando o cliente é removido.

## Pré-requisitos

- Node.js 18 ou superior.
- PostgreSQL em execução.

O banco deste projeto se chama `prazo`. Ele não usa os bancos `dw3` e `dw3_financeiro`.

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

O usuário de desenvolvimento criado pelo SQL é `admin`, com senha `admin`, no mesmo padrão da apostila. A senha fica gravada com `crypt` do PostgreSQL, não em texto puro.

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

Entre com `admin` / `admin`. O link Sair abre o login e apaga o cookie `IsLogged` e o token do `localStorage`.

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

## Decisões que diferem da apostila

Elas estão detalhadas em `PLANEJAMENTO.md`. Em resumo:

- As colunas se chamam `id` e `removido` porque o PDF pede ID e Removido. A apostila usa `alunoid` e `deleted`.
- Todas as rotas de clientes e serviços exigem JWT. No exemplo da aula, `getAllAlunos` ficava aberto.
- A mensagem de erro do banco não volta no JSON. O formato da resposta continua o da aula.
- A data sai do banco como `AAAA-MM-DD`, para não mudar o dia por causa do fuso.
- O host local do PostgreSQL é `localhost`. O exemplo com Docker usa `172.17.0.1`.

## Entrega no GitHub

O enunciado pede um repositório próprio, diferente do repositório das aulas, e o envio do link no Moodle. O arquivo `.gitignore` já ignora `node_modules`, `.env` e `dw3frontend.env`. A publicação do repositório remoto não foi feita nesta implementação.
