import type { Transaction } from '../types'

export const mockTransactions: Transaction[] = [
  { id: '1', data: '01/03/2024', descricao: 'Consulta Particular', categoria: 'Receita de Serviços', tipo: 'receita', valor: 3500, formaPagamento: 'PIX', status: 'conciliado' },
  { id: '2', data: '02/03/2024', descricao: 'Repasse UNIMED', categoria: 'Convênios', tipo: 'receita', valor: 12400, formaPagamento: 'Boleto', status: 'pendente' },
  { id: '3', data: '03/03/2024', descricao: 'Aluguel Consultório', categoria: 'Despesas Fixas', tipo: 'despesa', valor: 3200, formaPagamento: 'PIX', status: 'conciliado' },
  { id: '4', data: '05/03/2024', descricao: 'Material Descartável', categoria: 'Insumos', tipo: 'despesa', valor: 890, formaPagamento: 'Crédito', status: 'conciliado' },
  { id: '5', data: '07/03/2024', descricao: 'Repasse SulAmérica', categoria: 'Convênios', tipo: 'receita', valor: 5600, formaPagamento: 'Boleto', status: 'conciliado' },
  { id: '6', data: '10/03/2024', descricao: 'Salário Secretária', categoria: 'Folha', tipo: 'despesa', valor: 2500, formaPagamento: 'PIX', status: 'conciliado' },
  { id: '7', data: '12/03/2024', descricao: 'Teleconsultas', categoria: 'Receita de Serviços', tipo: 'receita', valor: 1800, formaPagamento: 'PIX', status: 'conciliado' },
  { id: '8', data: '15/03/2024', descricao: 'Conta de Energia', categoria: 'Despesas Fixas', tipo: 'despesa', valor: 450, formaPagamento: 'Boleto', status: 'conciliado' },
  { id: '9', data: '18/03/2024', descricao: 'Material de Escritório', categoria: 'Insumos', tipo: 'despesa', valor: 230, formaPagamento: 'Débito', status: 'pendente' },
  { id: '10', data: '20/03/2024', descricao: 'Repasse Bradesco Saúde', categoria: 'Convênios', tipo: 'receita', valor: 7200, formaPagamento: 'Boleto', status: 'conciliado' },
]
