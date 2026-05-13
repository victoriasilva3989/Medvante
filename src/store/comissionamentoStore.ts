import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CommissionRule, Commission } from '../types'

interface ComissionamentoState {
  rules: CommissionRule[]
  commissions: Commission[]

  addRule: (r: CommissionRule) => void
  updateRule: (id: string, data: Partial<CommissionRule>) => void
  removeRule: (id: string) => void

  addCommission: (c: Commission) => void
  payCommission: (id: string) => void
  calculateCommissions: (periodo: string, valorBase: number, profissionalId: string, profissionalNome: string) => Commission | null

  getPendingCommissions: () => Commission[]
  getPaidCommissions: () => Commission[]
}

export const useComissionamentoStore = create<ComissionamentoState>()(
  persist(
    (set, get) => ({
      rules: [],
      commissions: [],

      addRule: (r) => set(s => ({ rules: [...s.rules, r] })),
      updateRule: (id, data) => set(s => ({
        rules: s.rules.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      removeRule: (id) => set(s => ({ rules: s.rules.filter(r => r.id !== id) })),

      addCommission: (c) => set(s => ({ commissions: [...s.commissions, c] })),
      payCommission: (id) => set(s => ({
        commissions: s.commissions.map(c =>
          c.id === id
            ? { ...c, status: 'pago', dataPagamento: new Date().toISOString().split('T')[0] }
            : c
        )
      })),

      calculateCommissions: (periodo, valorBase, profissionalId, profissionalNome) => {
        const rules = get().rules.filter(r => r.profissionalId === profissionalId && r.ativo)
        if (rules.length === 0) return null

        const rule = rules[0]
        const valorComissao = rule.tipo === 'percentual' ? valorBase * (rule.valor / 100) : rule.valor

        const c: Commission = {
          id: 'comm-' + Date.now(),
          profissionalId,
          profissionalNome,
          periodo,
          valorBase,
          percentual: rule.tipo === 'percentual' ? rule.valor : 0,
          valorComissao,
          status: 'calculado',
        }
        return c
      },

      getPendingCommissions: () => get().commissions.filter(c => c.status !== 'pago'),
      getPaidCommissions: () => get().commissions.filter(c => c.status === 'pago'),
    }),
    { name: 'medvante-comissionamento' }
  )
)
