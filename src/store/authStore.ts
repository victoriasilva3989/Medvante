import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Collaborator } from '../types'

export interface MockClient {
  id: string
  nome: string
  email: string
  crm: string
  planStatus: string
  planType?: string
  lastAccess?: string
  faturamento?: number
}

interface RegisterData {
  nome: string
  email: string
  password: string
  crm: string
  especialidade: string
}

interface AuthState {
  user: User | null
  collaborators: Collaborator[]
  isAuthenticated: boolean
  isCollaborativeMode: boolean
  activeCollaborator: Collaborator | null
  originalUser: User | null
  impersonatedClient: MockClient | null
  registeredUsers: { email: string; password: string }[]

  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  setCollaborativeMode: (active: boolean) => void
  setActiveCollaborator: (collab: Collaborator | null) => void
  addCollaborator: (collab: Collaborator) => void
  removeCollaborator: (id: string) => void
  toggleCollaboratorAccess: (id: string) => void
  impersonateClient: (client: MockClient) => void
  restoreFromImpersonation: () => void
  getMockClientList: () => MockClient[]
  getPasswordForEmail: (email: string) => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  collaborators: [],
  isAuthenticated: false,
  isCollaborativeMode: false,
  activeCollaborator: null,
  originalUser: null,
  impersonatedClient: null,
  registeredUsers: [],

  login: async (email: string, password: string) => {
    const allowedLogins: Record<string, { nome: string; role: User['role']; crm?: string; especialidade?: string }> = {
      'admin@medvante.com.br': { nome: 'Admin', role: 'admin', crm: '000000', especialidade: 'Administrador' },
      'suporte@medvante.com.br': { nome: 'Suporte Medvante', role: 'support' },
      'produtor@medvante.com.br': { nome: 'Produtor Medvante', role: 'producer' },
    }

    if (allowedLogins[email]) {
      const demoPasswords: Record<string, string> = {
        'admin@medvante.com.br': 'admin123',
        'produtor@medvante.com.br': 'produtor123',
        'suporte@medvante.com.br': 'suporte123',
      }
      if (demoPasswords[email] !== password) return false
      const info = allowedLogins[email]
      set({
        user: {
          id: email,
          nome: info.nome,
          email,
          role: info.role,
          crm: info.crm,
          especialidade: info.especialidade,
          planStatus: 'active',
          planType: 'clinic',
        } as User,
        isAuthenticated: true,
        originalUser: null,
        impersonatedClient: null,
      })
      return true
    }

    const registered = get().registeredUsers.find(u => u.email === email && u.password === password)
    if (registered) {
      set({
        user: {
          id: email,
          nome: email.split('@')[0],
          email,
          role: 'doctor',
          crm: '',
          planStatus: 'trial',
          trialStartDate: new Date().toISOString(),
          trialDays: 7,
        } as User,
        isAuthenticated: true,
        originalUser: null,
        impersonatedClient: null,
      })
      return true
    }

    return false
  },

  register: async (data: RegisterData) => {
    const existing = get().registeredUsers.find(u => u.email === data.email)
    if (existing) return false

    set(state => ({
      registeredUsers: [...state.registeredUsers, { email: data.email, password: data.password }],
    }))

    set({
      user: {
        id: data.email,
        nome: data.nome,
        email: data.email,
        role: 'doctor',
        crm: data.crm,
        especialidade: data.especialidade,
        planStatus: 'trial',
        trialStartDate: new Date().toISOString(),
        trialDays: 14,
      } as User,
      isAuthenticated: true,
      originalUser: null,
      impersonatedClient: null,
    })
    return true
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isCollaborativeMode: false,
      activeCollaborator: null,
      originalUser: null,
      impersonatedClient: null,
    })
  },

  setCollaborativeMode: (active: boolean) => { set({ isCollaborativeMode: active }) },
  setActiveCollaborator: (collab: Collaborator | null) => { set({ activeCollaborator: collab }) },
  addCollaborator: (collab: Collaborator) => { set(s => ({ collaborators: [...s.collaborators, collab] })) },
  removeCollaborator: (id: string) => { set(s => ({ collaborators: s.collaborators.filter(c => c.id !== id) })) },
  toggleCollaboratorAccess: (id: string) => { set(s => ({ collaborators: s.collaborators.map(c => c.id === id ? { ...c, active: !c.active } : c) })) },

  impersonateClient: (client: MockClient) => {
    const { user } = get()
    if (!user) return
    set({
      originalUser: { ...user },
      impersonatedClient: client,
      user: {
        id: client.id,
        nome: client.nome,
        email: client.email,
        role: 'admin',
        crm: client.crm,
        planStatus: client.planStatus as User['planStatus'],
        planType: client.planType as User['planType'],
      } as User,
    })
  },

  restoreFromImpersonation: () => {
    const { originalUser } = get()
    if (!originalUser) return
    set({ user: originalUser, originalUser: null, impersonatedClient: null })
  },

  getMockClientList: () => {
    const registered = get().registeredUsers
    const clients: MockClient[] = registered.map((u, i) => ({
      id: 'client-' + i,
      nome: u.email.split('@')[0],
      email: u.email,
      crm: String(100000 + i),
      planStatus: i === 0 ? 'active' : i === 1 ? 'trial' : 'expired',
      planType: i === 0 ? 'pro' : undefined,
      lastAccess: new Date().toISOString(),
      faturamento: i === 0 ? 45000 : undefined,
    }))
    if (clients.length === 0) {
      clients.push(
        { id: 'demo-1', nome: 'Clínica Mendes', email: 'mendes@clinica.com.br', crm: '123456', planStatus: 'active', planType: 'clinic', lastAccess: new Date().toISOString(), faturamento: 128000 },
        { id: 'demo-2', nome: 'Dr. Carlos Silva', email: 'carlos@silva.com', crm: '789012', planStatus: 'trial', planType: 'starter', lastAccess: new Date().toISOString(), faturamento: 15000 },
        { id: 'demo-3', nome: 'Clínica Oliveira', email: 'oliveira@clinica.com', crm: '345678', planStatus: 'expired', planType: undefined, lastAccess: undefined, faturamento: undefined },
      )
    }
    return clients
  },

  getPasswordForEmail: (email: string) => {
    const demoPasswords: Record<string, string> = {
      'admin@medvante.com.br': 'admin123',
      'produtor@medvante.com.br': 'produtor123',
      'suporte@medvante.com.br': 'suporte123',
    }
    if (demoPasswords[email]) return demoPasswords[email]

    const registered = get().registeredUsers.find(u => u.email === email)
    return registered ? registered.password : null
  },
}),
    {
      name: 'medvante-auth',
      partialize: (state) => ({ registeredUsers: state.registeredUsers }),
    }
  )
)
