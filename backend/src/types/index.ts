export interface CertificadoInfo {
  id: string
  nome: string
  emissor: string
  validoAte: string
  diasRestantes: number
  tipo: 'A1' | 'A3'
  ambiente: 'producao' | 'homologacao'
  status: 'active' | 'expired'
  uploadEm: string
}

export interface NotaFiscal {
  id: string
  numero: string
  data: string
  tomador: string
  cpfCnpj: string
  valor: number
  status: 'autorizada' | 'rejeitada' | 'cancelada' | 'pendente'
  chaveAcesso?: string
  protocolo?: string
  xml?: string
  ambiente: 'producao' | 'homologacao'
}

export interface OpenFinanceAccount {
  id: string
  instituicao: string
  agencia: string
  conta: string
  saldo: number
  ultimaAtualizacao: string
}

export interface BankTransaction {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria?: string
  contaId: string
}
