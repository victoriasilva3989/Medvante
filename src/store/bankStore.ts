import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BankAccount {
  id: string
  nome: string
  agencia: string
  conta: string
  saldo: number
  tipo: 'Conta Corrente' | 'Conta Poupança' | 'Conta Pagamento'
  status: 'connected' | 'disconnected' | 'pending'
  ultimaAtualizacao: string
}

interface BankState {
  accounts: BankAccount[]
  loading: boolean
  error: string | null
  addAccount: (account: BankAccount) => void
  removeAccount: (id: string) => void
  updateSaldo: (id: string, saldo: number) => void
  updateStatus: (id: string, status: BankAccount['status']) => void
  getSaldoTotal: () => number
  getConnectedCount: () => number
  fetchContas: () => Promise<void>
}

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      accounts: [],
      loading: false,
      error: null,

      addAccount: (account) => set(s => ({ accounts: [...s.accounts, account] })),
      removeAccount: (id) => set(s => ({ accounts: s.accounts.filter(a => a.id !== id) })),
      updateSaldo: (id, saldo) => set(s => ({
        accounts: s.accounts.map(a => a.id === id ? { ...a, saldo, ultimaAtualizacao: new Date().toLocaleString('pt-BR') } : a)
      })),
      updateStatus: (id, status) => set(s => ({
        accounts: s.accounts.map(a => a.id === id ? { ...a, status } : a)
      })),
      getSaldoTotal: () => get().accounts.filter(a => a.status === 'connected').reduce((a, b) => a + b.saldo, 0),
      getConnectedCount: () => get().accounts.filter(a => a.status === 'connected').length,

      fetchContas: async () => {
        set({ loading: true, error: null })
        try {
          const { get } = await import('../services/api')
          const data = await get<{ id: string; banco_nome: string; agencia: string; numero_conta: string; saldo: number; tipo: string; ativo: boolean }[]>('/api/contas-bancarias')
          const accounts: BankAccount[] = data.map((c: any) => ({
            id: c.id,
            nome: c.banco_nome || 'Banco',
            agencia: c.agencia || '',
            conta: c.numero_conta || '',
            saldo: parseFloat(c.saldo) || 0,
            tipo: 'Conta Corrente',
            status: c.ativo ? 'connected' : 'disconnected',
            ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
          }))
          set({ accounts, loading: false })
        } catch (err) {
          set({ loading: false, error: err instanceof Error ? err.message : 'Erro ao buscar contas' })
        }
      },
    }),
    { name: 'medvante-banks', partialize: (state) => ({ accounts: state.accounts }) }
  )
)
