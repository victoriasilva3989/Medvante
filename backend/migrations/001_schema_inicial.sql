CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  inscricao_estadual VARCHAR(50),
  inscricao_municipal VARCHAR(50),
  regime_tributario VARCHAR(20),
  endereco JSONB,
  contato JSONB,
  plano VARCHAR(20) DEFAULT 'starter',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(5) NOT NULL,
  nome_titular VARCHAR(255),
  cnpj_titular VARCHAR(18),
  emissor VARCHAR(100),
  numero_serie VARCHAR(100),
  validade_inicio DATE,
  validade_fim DATE,
  caminho_arquivo VARCHAR(500),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nfe_entrada (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  chave_acesso VARCHAR(44) UNIQUE NOT NULL,
  numero INTEGER,
  serie VARCHAR(10),
  data_emissao TIMESTAMP,
  data_recebimento TIMESTAMP,
  cnpj_emitente VARCHAR(18),
  nome_emitente VARCHAR(255),
  valor_total DECIMAL(15,2),
  valor_icms DECIMAL(15,2),
  valor_ipi DECIMAL(15,2),
  valor_pis DECIMAL(15,2),
  valor_cofins DECIMAL(15,2),
  cfop VARCHAR(10),
  natureza_operacao VARCHAR(255),
  xml_completo TEXT,
  status VARCHAR(30) DEFAULT 'pendente',
  manifestacao VARCHAR(30),
  lancado_estoque BOOLEAN DEFAULT false,
  lancado_contas_pagar BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nfe_entrada_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfe_entrada_id UUID REFERENCES nfe_entrada(id) ON DELETE CASCADE,
  numero_item INTEGER,
  codigo_produto VARCHAR(60),
  descricao VARCHAR(255),
  ncm VARCHAR(10),
  cfop VARCHAR(10),
  unidade VARCHAR(10),
  quantidade DECIMAL(15,4),
  valor_unitario DECIMAL(15,4),
  valor_total DECIMAL(15,2),
  valor_icms DECIMAL(15,2),
  valor_ipi DECIMAL(15,2)
);

CREATE TABLE nfe_saida (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  chave_acesso VARCHAR(44),
  numero INTEGER,
  serie VARCHAR(10),
  data_emissao TIMESTAMP,
  cnpj_destinatario VARCHAR(18),
  cpf_destinatario VARCHAR(14),
  nome_destinatario VARCHAR(255),
  valor_total DECIMAL(15,2),
  natureza_operacao VARCHAR(255),
  cfop VARCHAR(10),
  xml_assinado TEXT,
  protocolo_autorizacao VARCHAR(50),
  status VARCHAR(30) DEFAULT 'rascunho',
  ambiente VARCHAR(15) DEFAULT 'homologacao',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nfse_saida (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero_rps VARCHAR(20),
  serie_rps VARCHAR(10),
  numero_nfse VARCHAR(20),
  data_emissao TIMESTAMP,
  cnpj_tomador VARCHAR(18),
  cpf_tomador VARCHAR(14),
  nome_tomador VARCHAR(255),
  descricao_servico TEXT,
  codigo_servico VARCHAR(20),
  valor_servico DECIMAL(15,2),
  valor_iss DECIMAL(15,2),
  aliquota_iss DECIMAL(5,4),
  municipio_prestacao VARCHAR(100),
  codigo_municipio VARCHAR(10),
  status VARCHAR(30) DEFAULT 'rascunho',
  ambiente VARCHAR(15) DEFAULT 'homologacao',
  xml_rps TEXT,
  xml_nfse TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(60),
  descricao VARCHAR(255) NOT NULL,
  ncm VARCHAR(10),
  unidade VARCHAR(10),
  quantidade DECIMAL(15,4) DEFAULT 0,
  custo_medio DECIMAL(15,4),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estoque_id UUID REFERENCES estoque(id),
  empresa_id UUID REFERENCES empresas(id),
  tipo VARCHAR(10) NOT NULL,
  quantidade DECIMAL(15,4),
  custo_unitario DECIMAL(15,4),
  origem VARCHAR(30),
  origem_id UUID,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  descricao VARCHAR(255),
  fornecedor VARCHAR(255),
  cnpj_fornecedor VARCHAR(18),
  valor DECIMAL(15,2),
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'pendente',
  origem VARCHAR(30),
  origem_id UUID,
  nfe_duplicata VARCHAR(60),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  descricao VARCHAR(255),
  cliente VARCHAR(255),
  cnpj_cliente VARCHAR(18),
  cpf_cliente VARCHAR(14),
  valor DECIMAL(15,2),
  data_vencimento DATE,
  data_recebimento DATE,
  status VARCHAR(20) DEFAULT 'pendente',
  origem VARCHAR(30),
  origem_id UUID,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contas_bancarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  banco_nome VARCHAR(100),
  banco_ispb VARCHAR(10),
  agencia VARCHAR(10),
  numero_conta VARCHAR(20),
  tipo VARCHAR(20),
  saldo DECIMAL(15,2),
  saldo_atualizado_em TIMESTAMP,
  open_finance_consentimento_id VARCHAR(255),
  open_finance_account_id VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_id UUID REFERENCES contas_bancarias(id),
  empresa_id UUID REFERENCES empresas(id),
  data_lancamento DATE,
  data_transacao DATE,
  tipo VARCHAR(20),
  valor DECIMAL(15,2),
  descricao TEXT,
  categoria VARCHAR(50),
  open_finance_transaction_id VARCHAR(255) UNIQUE,
  conciliado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  ip_origem VARCHAR(45),
  user_agent TEXT,
  revogado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID,
  usuario_id UUID,
  acao VARCHAR(100),
  tabela_afetada VARCHAR(100),
  registro_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip_origem VARCHAR(45),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nfe_entrada_empresa ON nfe_entrada(empresa_id);
CREATE INDEX idx_nfe_entrada_chave ON nfe_entrada(chave_acesso);
CREATE INDEX idx_nfe_saida_empresa ON nfe_saida(empresa_id);
CREATE INDEX idx_contas_pagar_empresa ON contas_pagar(empresa_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_receber_empresa ON contas_receber(empresa_id);
CREATE INDEX idx_estoque_empresa ON estoque(empresa_id);
CREATE INDEX idx_transacoes_conta ON transacoes_bancarias(conta_id);
CREATE INDEX idx_auditoria_empresa ON auditoria(empresa_id);

-- Tabela de configuração chave/valor usada pelos jobs
CREATE TABLE IF NOT EXISTS _config (
  chave VARCHAR(255) PRIMARY KEY,
  valor TEXT,
  atualizado_em TIMESTAMP DEFAULT NOW()
);
