CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(30) UNIQUE NOT NULL,
    password text NOT NULL,
    removido boolean DEFAULT false
);

INSERT INTO usuarios (username, password)
VALUES ('admin', crypt('admin', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS clientes (
    id bigserial CONSTRAINT pk_clientes PRIMARY KEY,
    nome varchar(100) NOT NULL,
    email varchar(120) NOT NULL UNIQUE,
    telefone varchar(20),
    removido boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS servicos (
    id bigserial CONSTRAINT pk_servicos PRIMARY KEY,
    clienteid bigint NOT NULL CONSTRAINT fk_servico_cliente REFERENCES clientes (id),
    titulo varchar(120) NOT NULL,
    descricao varchar(500),
    valor numeric(12, 2) NOT NULL CONSTRAINT ck_servico_valor CHECK (valor >= 0),
    dataentrega date NOT NULL,
    removido boolean DEFAULT false
);

INSERT INTO clientes (nome, email, telefone)
VALUES
    ('Ana Lima', 'ana.lima@example.com', '(17) 99999-0001'),
    ('Bruno Costa', 'bruno.costa@example.com', '(17) 98888-0002')
ON CONFLICT (email) DO NOTHING;

INSERT INTO servicos (clienteid, titulo, descricao, valor, dataentrega)
SELECT clientes.id,
       'Site institucional',
       'Paginas e formulario de contato',
       1800.00,
       DATE '2026-11-15'
FROM clientes
WHERE clientes.email = 'ana.lima@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM servicos
      WHERE servicos.titulo = 'Site institucional'
        AND servicos.clienteid = clientes.id
        AND servicos.removido = false
  );
