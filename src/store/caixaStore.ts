import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CashRegister, CashMovement, DREEntry } from '../types'

interface CaixaState {
  registers: CashRegister[]
  dreEntries: DREEntry[]

  openRegister: (r: CashRegister) => void
  closeRegister: (id: string, saldoFinal: number) => void
  addMovement: (m: CashMovement) => void
  getRegisterByDate: (data: string) => CashRegister | undefined
  getCurrentRegister: () => CashRegister | undefined

  addDREEntry: (e: DREEntry) => void
  getDREByPeriod: (mes: number, ano: number) => { receitas: number; despesas: number; resultado: number; entries: DREEntry[] }
}

export const useCaixaStore = create<CaixaState>()(
  persist(
    (set, get) => ({
      registers: [],
      dreEntries: [],

      openRegister: (r) => set(s => ({ registers: [...s.registers, r] })),
      closeRegister: (id, saldoFinal) => set(s => ({
        registers: s.registers.map(r =>
          r.id === id
            ? { ...r, status: 'fechado', saldoFinal, horarioFechamento: new Date().toLocaleTimeString('pt-BR') }
            : r
        )
      })),
      addMovement: (m) => set(s => ({
        registers: s.registers.map(r =>
          r.id === m.caixaId
            ? {
                ...r,
                movimentos: [...r.movimentos, m],
                totalEntradas: m.tipo === 'entrada' ? r.totalEntradas + m.valor : r.totalEntradas,
                totalSaidas: m.tipo === 'saida' ? r.totalSaidas + m.valor : r.totalSaidas,
              }
            : r
        )
      })),
      getRegisterByDate: (data) => get().registers.find(r => r.data === data),
      getCurrentRegister: () => {
        const hoje = new Date().toISOString().split('T')[0]
        return get().registers.find(r => r.data === hoje && r.status === 'aberto')
      },

      addDREEntry: (e) => set(s => ({ dreEntries: [...s.dreEntries, e] })),
      getDREByPeriod: (mes, ano) => {
        const entries = get().dreEntries.filter(e => e.mes === mes && e.ano === ano)
        const receitas = entries.filter(e => e.tipo === 'receita').reduce((a, b) => a + b.valor, 0)
        const despesas = entries.filter(e => e.tipo === 'despesa').reduce((a, b) => a + b.valor, 0)
        return { receitas, despesas, resultado: receitas - despesas, entries }
      },
    }),
    { name: 'medvante-caixa' }
  )
)
