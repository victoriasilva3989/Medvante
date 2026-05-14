-- 001_schema.sql — Medvante full schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Empresas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj          VARCHAR(18) UNIQUE NOT NULL,
  razao_social  VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  ie            VARCHAR(20),
  im            VARCHAR(20),
  cnae          VARCHAR(10),
  crt           SMALLINT DEFAULT 3,
  regime_tributario VARCHAR(50) DEFAULT 'Simples Nacional',
  endereco_logradouro VARCHAR(255),
  endereco_numero     VARCHAR(20),
  endereco_bairro     VARCHAR(100),
  endereco_cidade     VARCHAR(100),
  endereco_uf         CHAR(2),
  endereco_cep        VARCHAR(9),
  telefone      VARCHAR(20),
  email         VARCHAR(255),
  certificado_path    VARCHAR(500),
  certificado_senha   VARCHAR(500),
  certificado_validade DATE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── Usuarios ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id    UUID REFERENCES empresas(id) ON DELETE CASCADE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  nome          VARCHAR(255) NOT NULL,
  role          VARCHAR(50) DEFAULT 'doctor',
  crm           VARCHAR(20),
  especialidade VARCHAR(255),
  ativo         BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ─── NFe Entrada (recebidas) ──────────────────────
CREATE TABLE IF NOT EXISTS nfe_entrada (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  chave_acesso    VARCHAR(44) UNIQUE NOT NULL,
  numero          VARCHAR(20),
  serie           VARCHAR(5),
  data_emissao    DATE,
  data_recebimento DATE,
  cnpj_emitente   VARCHAR(18),
  nome_emitente   VARCHAR(255),
  cnpj_destinatario VARCHAR(18),
  nome_destinatario VARCHAR(255),
  valor_total     NUMERIC(15,2) DEFAULT 0,
  valor_produtos  NUMERIC(15,2) DEFAULT 0,
  valor_servicos  NUMERIC(15,2) DEFAULT 0,
  valor_desconto  NUMERIC(15,2) DEFAULT 0,
  valor_frete     NUMERIC(15,2) DEFAULT 0,
  base_calculo_icms NUMERIC(15,2) DEFAULT 0,
  valor_icms      NUMERIC(15,2) DEFAULT 0,
  xml             TEXT,
  status          VARCHAR(50) DEFAULT 'autorizada',
  ambiente        SMALLINT DEFAULT 2,
  protocolo       VARCHAR(50),
  processado      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── NFe Entrada Itens ──────────────────────────
CREATE TABLE IF NOT EXISTS nfe_entrada_itens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfe_id          UUID REFERENCES nfe_entrada(id) ON DELETE CASCADE,
  codigo          VARCHAR(60),
  descricao       VARCHAR(255) NOT NULL,
  ncm             VARCHAR(10),
  cfop            VARCHAR(10),
  unidade         VARCHAR(10),
  quantidade      NUMERIC(15,4) DEFAULT 1,
  valor_unitario  NUMERIC(15,4) DEFAULT 0,
  valor_total     NUMERIC(15,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(nfe_id, codigo, descricao)
);

-- ─── NFe Saida (emitidas) ─────────────────────────
CREATE TABLE IF NOT EXISTS nfe_saida (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  chave_acesso    VARCHAR(44) UNIQUE NOT NULL,
  numero          VARCHAR(20),
  serie           VARCHAR(5),
  data_emissao    DATE,
  tomador         VARCHAR(255),
  cpf_cnpj        VARCHAR(18),
  valor           NUMERIC(15,2) DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'pendente',
  protocolo       VARCHAR(50),
  xml             TEXT,
  ambiente        SMALLINT DEFAULT 2,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── NFSe Saida (notas de servico) ────────────────
CREATE TABLE IF NOT EXISTS nfse_saida (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero          VARCHAR(20),
  codigo_verificacao VARCHAR(50),
  data_emissao    DATE,
  rps_numero      VARCHAR(20),
  rps_serie       VARCHAR(5),
  rps_tipo        SMALLINT DEFAULT 1,
  tomador         VARCHAR(255),
  cpf_cnpj        VARCHAR(18),
  descricao       VARCHAR(500),
  valor           NUMERIC(15,2) DEFAULT 0,
  iss_aliquota    NUMERIC(5,2) DEFAULT 2.00,
  iss_valor       NUMERIC(15,2) DEFAULT 0,
  competencia     VARCHAR(7),
  servico_codigo  VARCHAR(10),
  servico_descricao VARCHAR(500),
  status          VARCHAR(50) DEFAULT 'pendente',
  xml             TEXT,
  ambiente        SMALLINT DEFAULT 2,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Estoque ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS estoque (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo          VARCHAR(60),
  descricao       VARCHAR(255) NOT NULL,
  ncm             VARCHAR(10),
  unidade         VARCHAR(10),
  quantidade      NUMERIC(15,4) DEFAULT 0,
  quantidade_min  NUMERIC(15,4) DEFAULT 0,
  valor_unitario  NUMERIC(15,4) DEFAULT 0,
  valor_total     NUMERIC(15,2) DEFAULT 0,
  lote            VARCHAR(50),
  validade        DATE,
  nfe_origem_id   UUID REFERENCES nfe_entrada(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Contas a Pagar ───────────────────────────────
CREATE TABLE IF NOT EXISTS contas_pagar (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nfe_origem_id   UUID REFERENCES nfe_entrada(id),
  fornecedor      VARCHAR(255) NOT NULL,
  descricao       VARCHAR(500),
  valor           NUMERIC(15,2) NOT NULL,
  data_vencimento DATE,
  data_pagamento  DATE,
  status          VARCHAR(50) DEFAULT 'pendente',
  categoria       VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Contas a Receber ─────────────────────────────
CREATE TABLE IF NOT EXISTS contas_receber (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente        VARCHAR(255),
  procedimento    VARCHAR(255),
  convenio        VARCHAR(255),
  valor           NUMERIC(15,2) NOT NULL,
  data_emissao    DATE,
  data_vencimento DATE,
  data_recebimento DATE,
  status          VARCHAR(50) DEFAULT 'pendente',
  nfse_origem_id  UUID REFERENCES nfse_saida(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Contas Bancarias ─────────────────────────────
CREATE TABLE IF NOT EXISTS contas_bancarias (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  instituicao     VARCHAR(100) NOT NULL,
  agencia         VARCHAR(10),
  conta           VARCHAR(20),
  tipo            VARCHAR(50) DEFAULT 'Conta Corrente',
  saldo_inicial   NUMERIC(15,2) DEFAULT 0,
  saldo_atual     NUMERIC(15,2) DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'ativa',
  conectada_of    BOOLEAN DEFAULT FALSE,
  ultima_atualizacao TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Transacoes Bancarias ─────────────────────────
CREATE TABLE IF NOT EXISTS transacoes_bancarias (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_id        UUID REFERENCES contas_bancarias(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  descricao       VARCHAR(500),
  valor           NUMERIC(15,2) NOT NULL,
  tipo            VARCHAR(10) CHECK (tipo IN ('debito','credito')),
  categoria       VARCHAR(100),
  conciliada      BOOLEAN DEFAULT FALSE,
  external_id     VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Sessoes (prontuario) ─────────────────────────
CREATE TABLE IF NOT EXISTS sessoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id     UUID,
  profissional_id UUID REFERENCES usuarios(id),
  data_hora       TIMESTAMP,
  tipo            VARCHAR(50),
  observacao      TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Auditoria ────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID REFERENCES usuarios(id),
  acao            VARCHAR(100) NOT NULL,
  entidade        VARCHAR(100),
  entidade_id     UUID,
  detalhes        JSONB,
  ip              VARCHAR(45),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Config (chave/valor para scripts) ────────────
CREATE TABLE IF NOT EXISTS _config (
  chave       VARCHAR(255) PRIMARY KEY,
  valor       TEXT,
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ─── Indices ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_nfe_entrada_empresa ON nfe_entrada(empresa_id);
CREATE INDEX IF NOT EXISTS idx_nfe_entrada_chave  ON nfe_entrada(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_nfe_entrada_itens_nfe ON nfe_entrada_itens(nfe_id);
CREATE INDEX IF NOT EXISTS idx_nfe_saida_empresa  ON nfe_saida(empresa_id);
CREATE INDEX IF NOT EXISTS idx_nfse_saida_empresa ON nfse_saida(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_empresa    ON estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa ON contas_pagar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa ON contas_receber(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_bancarias_empresa ON contas_bancarias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta   ON transacoes_bancarias(conta_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_paciente   ON sessoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario  ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao     ON auditoria(acao, created_at DESC);
