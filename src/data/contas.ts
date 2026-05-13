import type { Transaction } from '../types'

export interface ContaReceber {
  id: string
  paciente: string
  valor: number
  procedimento: string
  tipo: 'particular' | 'convenio'
  convenio?: string
  emissao: string
  vencimento: string
  status: 'pendente' | 'recebido' | 'parcial' | 'atrasado'
  diasAtraso: number
}

export interface ContaPagar {
  id: string
  descricao: string
  valor: number
  categoria: string
  vencimento: string
  fornecedor: string
  status: 'pendente' | 'pago' | 'parcial' | 'atrasado'
  diasAtraso: number
}

export const mockContasReceber: ContaReceber[] = []
export const mockContasPagar: ContaPagar[] = []
export const mockExtratoBancario: Transaction[] = []
