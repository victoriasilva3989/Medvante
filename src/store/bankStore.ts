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
  addAccount: (account: BankAccount) => void
  removeAccount: (id: string) => void
  updateSaldo: (id: string, saldo: number) => void
  updateStatus: (id: string, status: BankAccount['status']) => void
  getSaldoTotal: () => number
  getConnectedCount: () => number
}

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      accounts: [
        { id: 'b1', nome: 'Banco do Brasil', agencia: '1234-5', conta: '45.678-9', saldo: 0, tipo: 'Conta Corrente', status: 'connected', ultimaAtualizacao: '—' },
        { id: 'b2', nome: 'NuBank', agencia: '0001', conta: '987654321', saldo: 0, tipo: 'Conta Corrente', status: 'connected', ultimaAtualizacao: '—' },
      ],

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
    }),
    { name: 'medvante-banks' }
  )
)
