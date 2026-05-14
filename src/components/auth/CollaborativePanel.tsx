import { X, Users, UserPlus, Shield, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Collaborator } from '../../types'

const mockCollaborators: Collaborator[] = []

export function CollaborativePanel() {
  const { user, setCollaborativeMode, activeCollaborator, setActiveCollaborator } = useAuthStore()

  const handleAccessClient = async (collab: Collaborator) => {
    setActiveCollaborator(collab)
  }

  const handleExitAccess = () => {
    setActiveCollaborator(null)
  }

  return (
    <div className="w-80 bg-bg-sidebar border-l border-white/5 h-screen overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-brand" />
            <h3 className="text-sm font-medium text-text-on-dark">Acesso Colaborativo</h3>
          </div>
          <button onClick={() => setCollaborativeMode(false)} className="text-text-on-dark2 hover:text-text-on-dark cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className="text-[10px] text-text-on-dark2/60">Central delegada de suporte e colaboração</p>
      </div>

      {/* Active session */}
      {activeCollaborator && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-blue-brand/10 border border-blue-brand/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-blue-brand" />
            <span className="text-xs font-medium text-blue-brand">Sessão ativa</span>
            <Badge variant="green">AO VIVO</Badge>
          </div>
          <p className="text-sm text-text-on-dark">{activeCollaborator.nome}</p>
          <p className="text-[10px] text-text-on-dark2/60">{activeCollaborator.email}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" size="sm" className="!bg-white/5 !text-text-on-dark !border-white/10 hover:!bg-white/10" onClick={handleExitAccess}>
              Encerrar
            </Button>
          </div>
        </div>
      )}

      {/* Client Access Section */}
      {user?.role === 'support' && !activeCollaborator && (
        <div className="px-3 mt-4">
          <p className="text-[10px] uppercase tracking-wider text-text-on-dark2/50 font-medium mb-2 px-1">Clientes em suporte</p>
          <div className="space-y-2">
            <p className="text-xs text-text-on-dark2/60 px-1 py-4 text-center">Nenhum cliente em suporte no momento.</p>
          </div>
        </div>
      )}

      {/* My Collaborators (doctor's view) */}
      {user?.role !== 'support' && (
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] uppercase tracking-wider text-text-on-dark2/50 font-medium">Colaboradores</p>
            <Button variant="ghost" size="sm" className="!text-blue-brand !p-0 !h-auto">
              <UserPlus size={14} />
            </Button>
          </div>

          <div className="space-y-2">
            {mockCollaborators.map((collab) => (
              <div key={collab.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-mid/30 flex items-center justify-center text-xs font-medium text-text-on-dark">
                  {collab.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-text-on-dark truncate">{collab.nome}</p>
                    <Badge variant={collab.role === 'support' ? 'blue' : 'amber'}>
                      {collab.role === 'support' ? 'Suporte' : 'Colab'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} className="text-text-on-dark2/60" />
                    <span className="text-[10px] text-text-on-dark2/60">{collab.lastAccess}</span>
                  </div>
                </div>
                <button
                  onClick={() => collab.active ? handleAccessClient(collab) : null}
                  className={`text-[10px] font-medium cursor-pointer ${collab.active ? 'text-success' : 'text-text-muted'}`}
                >
                  {collab.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-3 mt-6">
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <p className="text-[10px] text-text-on-dark2/80 leading-relaxed">
            <strong className="text-text-on-dark">Central Delegada:</strong> O acesso colaborativo permite que sua equipe de suporte ou consultores acessem o sistema com permissões controladas, sem compartilhar senhas.
          </p>
          <a href="#" className="text-[10px] text-blue-brand mt-2 inline-block hover:underline">Saber mais</a>
        </div>
      </div>
    </div>
  )
}
