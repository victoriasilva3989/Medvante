import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Collaborator } from '../types'

const TOKEN_KEY = 'medvante-token'

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

function isTokenValid(): boolean {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  collaborators: [],
  isAuthenticated: isTokenValid(),
  isCollaborativeMode: false,
  activeCollaborator: null,
  originalUser: null,
  impersonatedClient: null,
  registeredUsers: [],

  login: async (email: string, password: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Email ou senha inválidos' }))
        throw new Error(err.error || 'Email ou senha inválidos')
      }

      const data = await res.json()
      localStorage.setItem(TOKEN_KEY, data.token)

      set({
        user: {
          id: data.user.email,
          nome: data.user.nome,
          email: data.user.email,
          role: data.user.role || 'doctor',
          crm: '',
          planStatus: 'active',
          planType: 'starter',
        } as User,
        isAuthenticated: true,
      })

      return true
    } catch {
      return false
    }
  },

  register: async (data: RegisterData) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            nome: data.nome,
            role: 'doctor',
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao cadastrar' }))
        throw new Error(err.error || 'Erro ao cadastrar')
      }

      // Auto-login after register
      return await get().login(data.email, data.password)
    } catch {
      return false
    }
  },

  logout: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/logout`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
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
    return clients
  },

  getPasswordForEmail: (email: string) => {
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
