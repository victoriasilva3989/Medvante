import { create } from 'zustand'
import type { User, Collaborator } from '../types'

interface AuthState {
  user: User | null
  collaborators: Collaborator[]
  isAuthenticated: boolean
  isCollaborativeMode: boolean
  activeCollaborator: Collaborator | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setCollaborativeMode: (active: boolean) => void
  setActiveCollaborator: (collab: Collaborator | null) => void
  addCollaborator: (collab: Collaborator) => void
  removeCollaborator: (id: string) => void
  toggleCollaboratorAccess: (id: string) => void
}

const mockUsers = [
  {
    id: '1',
    nome: 'Dr. Carlos Mendes',
    email: 'admin@medvante.com.br',
    role: 'admin' as const,
    crm: '123456-SP',
    especialidade: 'Cardiologia',
    regimeTributario: 'Lucro Presumido',
    planStatus: 'active' as const,
    planType: 'clinic' as const,
  },
  {
    id: '2',
    nome: 'Dra. Ana Oliveira',
    email: 'medico@medvante.com.br',
    role: 'doctor' as const,
    crm: '789012-RJ',
    especialidade: 'Dermatologia',
    regimeTributario: 'Simples Nacional',
    planStatus: 'trial' as const,
    trialStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    trialDays: 14,
  },
  {
    id: '3',
    nome: 'Suporte Medvante',
    email: 'suporte@medvante.com.br',
    role: 'support' as const,
    planStatus: 'active' as const,
  },
]

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  collaborators: [],
  isAuthenticated: false,
  isCollaborativeMode: false,
  activeCollaborator: null,

  login: async (email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      set({ user: found as User, isAuthenticated: true })
      return true
    }
    return false
  },

  _getState: () => get(),

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isCollaborativeMode: false,
      activeCollaborator: null,
    })
  },

  setCollaborativeMode: (active: boolean) => {
    set({ isCollaborativeMode: active })
  },

  setActiveCollaborator: (collab: Collaborator | null) => {
    set({ activeCollaborator: collab })
  },

  addCollaborator: (collab: Collaborator) => {
    set((state) => ({
      collaborators: [...state.collaborators, collab],
    }))
  },

  removeCollaborator: (id: string) => {
    set((state) => ({
      collaborators: state.collaborators.filter((c) => c.id !== id),
    }))
  },

  toggleCollaboratorAccess: (id: string) => {
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      ),
    }))
  },
}))
