export type PlanType = 'starter' | 'pro' | 'clinic'
export type PlanStatus = 'trial' | 'active' | 'expired' | 'grace'
export type UserRole = 'admin' | 'doctor' | 'support' | 'collaborator' | 'reception' | 'producer'

export interface User {
  id: string
  nome: string
  email: string
  avatar?: string
  role: UserRole
  crm?: string
  especialidade?: string
  regimeTributario?: string
  planStatus: PlanStatus
  planType?: PlanType
  trialStartDate?: string
  trialDays?: 7 | 14
}

export interface Collaborator {
  id: string
  nome: string
  email: string
  avatar?: string
  role: 'support' | 'collaborator'
  masterUserId: string
  permissions: string[]
  lastAccess?: string
  active: boolean
}

export interface Appointment {
  id: string
  data: string
  horario?: string
  paciente_nome: string
  paciente_cpf?: string
  procedimento: string
  tipo: 'particular' | 'convenio' | 'telemedicina'
  convenio?: string
  valor: number
  status: 'pago' | 'pendente' | 'parcial'
  local?: string
  observacao?: string
  importado?: boolean
}

export interface Transaction {
  id: string
  data: string
  descricao: string
  categoria: string
  tipo: 'receita' | 'despesa'
  valor: number
  formaPagamento?: string
  status: 'conciliado' | 'pendente' | 'divergente'
  conta?: string
  observacao?: string
}

export interface PipelineCard {
  id: string
  paciente: string
  valor: number
  diasAtraso: number
  procedimento: string
  contato?: string
  observacao?: string
  etapa: 'nao-contatado' | 'contatado' | 'negociacao' | 'acordo' | 'recuperado'
}

export interface Glosa {
  id: string
  paciente: string
  convenio: string
  procedimento: string
  valorOriginal: number
  valorGlosado: number
  motivo: string
  data: string
  status: 'aberta' | 'contestada' | 'reembolsada' | 'perdida'
  prazoRecurso?: string
}

export interface Patient {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  dataNascimento?: string
  endereco?: string
  ultimaConsulta?: string
  totalGasto?: number
  convenio?: string
  observacoes?: string
}

export interface MedicalRecord {
  id: string
  pacienteId: string
  pacienteNome: string
  data: string
  tipo: 'consulta' | 'retorno' | 'exame' | 'procedimento'
  anamnese?: string
  diagnostico?: string
  prescricao?: string
  exames?: string[]
  observacoes?: string
  medicoId: string
  medicoNome: string
  assinado: boolean
  createdAt: string
}

export interface TreatmentProtocol {
  id: string
  pacienteId: string
  pacienteNome: string
  nome: string
  descricao: string
  sessoesTotal: number
  sessoesRealizadas: number
  valorPorSessao: number
  valorTotal: number
  status: 'ativo' | 'concluido' | 'pausado' | 'cancelado'
  dataInicio: string
  dataFim?: string
  observacoes?: string
}

export interface TreatmentSession {
  id: string
  protocoloId: string
  pacienteId: string
  pacienteNome: string
  data: string
  horario: string
  procedimento: string
  valor: number
  status: 'agendada' | 'realizada' | 'faltou' | 'cancelada'
  observacoes?: string
  realizadoPor?: string
}

export interface CashRegister {
  id: string
  data: string
  horarioAbertura: string
  horarioFechamento?: string
  saldoInicial: number
  saldoFinal?: number
  totalEntradas: number
  totalSaidas: number
  status: 'aberto' | 'fechado'
  observacoes?: string
  movimentos: CashMovement[]
}

export interface CashMovement {
  id: string
  caixaId: string
  data: string
  horario: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  formaPagamento: 'dinheiro' | 'credito' | 'debito' | 'pix' | 'boleto'
  categoria: string
  paciente?: string
  observacao?: string
}

export interface DREEntry {
  id: string
  mes: number
  ano: number
  categoria: string
  tipo: 'receita' | 'despesa'
  valor: number
  descricao: string
  data: string
}

export interface CommissionRule {
  id: string
  profissionalId: string
  profissionalNome: string
  tipo: 'percentual' | 'fixo'
  valor: number
  procedimentos: string[]
  ativo: boolean
}

export interface Commission {
  id: string
  profissionalId: string
  profissionalNome: string
  periodo: string
  valorBase: number
  percentual: number
  valorComissao: number
  status: 'calculado' | 'pago' | 'pendente'
  dataPagamento?: string
}

export interface RecurrencePlan {
  id: string
  pacienteId: string
  pacienteNome: string
  descricao: string
  valor: number
  diaVencimento: number
  periodicidade: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  dataInicio: string
  dataFim?: string
  status: 'ativo' | 'pausado' | 'cancelado'
  proximoCobranca: string
  observacoes?: string
}

export interface ABCPatient {
  pacienteId: string
  pacienteNome: string
  receitaTotal: number
  percentualReceita: number
  frequencia: number
  classe: 'A' | 'B' | 'C'
}

export interface PricingRule {
  id: string
  procedimento: string
  custoInsumos: number
  custoOperacional: number
  margemLucro: number
  valorSugerido: number
  valorPraticado: number
  categoria: string
}

export interface StockItem {
  id: string
  nome: string
  categoria: string
  quantidade: number
  quantidadeMinima: number
  unidade: string
  valorUnitario: number
  validade?: string
  fornecedor?: string
}

export interface TeamMember {
  id: string
  nome: string
  cargo: string
  email: string
  telefone?: string
  dataContratacao: string
  salario: number
  comissao?: number
  ativo: boolean
}

export interface Budget {
  id: string
  paciente: string
  procedimentos: { nome: string; valor: number }[]
  valorTotal: number
  data: string
  validade: string
  status: 'orçamento' | 'aprovado' | 'recusado' | 'convertido'
  observacao?: string
}

export interface Campaign {
  id: string
  nome: string
  tipo: 'whatsapp' | 'email' | 'sms'
  disparos: number
  abertos: number
  respondidos: number
  taxaConversao: number
  data: string
  status: 'rascunho' | 'agendada' | 'enviada' | 'concluida'
}

export interface NPSEvaluation {
  id: string
  paciente: string
  nota: number
  comentario?: string
  data: string
  atendimentoId: string
}

export interface Prescription {
  id: string
  paciente: string
  medicamentos: { nome: string; dosagem: string; quantidade: string; observacao?: string }[]
  data: string
  assinada: boolean
}

export interface NotaFiscal {
  id: string
  numero: string
  dataEmissao: string
  tomador: string
  valor: number
  status: 'emitida' | 'cancelada' | 'pendente'
  servico: string
}

export interface ImportRecord {
  id: string
  data: string
  tipo: string
  registros: number
  validos: number
  erros: number
  status: 'concluido' | 'parcial' | 'falha'
}

export type ModuleName =
  | 'dashboard' | 'financeiro' | 'atendimentos' | 'pipeline' | 'glosas'
  | 'notafiscal' | 'importacao' | 'estoque' | 'orcamentos' | 'marketing'
  | 'recepcao' | 'equipe' | 'ia' | 'integracoes' | 'configuracoes' | 'seguranca'
  | 'prontuario' | 'prescricoes' | 'caixa' | 'dre' | 'curva-abc'
  | 'planos-recorrencia' | 'comissionamento'
