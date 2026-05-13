import { X, Users, UserPlus, Shield, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../i18n/useI18n'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Collaborator } from '../../types'

const mockCollaborators: Collaborator[] = [
  { id: 'c1', nome: 'Suporte Medvante', email: 'suporte@medvante.com.br', role: 'support', masterUserId: '1', permissions: ['dashboard', 'financeiro', 'pipeline', 'glosas'], lastAccess: '12/05/2026 14:30', active: true },
  { id: 'c2', nome: 'Consultor Felipe', email: 'felipe@medvante.com.br', role: 'collaborator', masterUserId: '1', permissions: ['dashboard', 'financeiro', 'pipeline'], lastAccess: '11/05/2026 09:15', active: true },
  { id: 'c3', nome: 'Ana (Recepção)', email: 'ana@clinicamendes.com.br', role: 'collaborator', masterUserId: '1', permissions: ['atendimentos', 'recepcao'], lastAccess: '10/05/2026 17:45', active: false },
]

export function CollaborativePanel() {
  const { user, setCollaborativeMode, activeCollaborator, setActiveCollaborator } = useAuthStore()
  const { t } = useI18n()

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
            <h3 className="text-sm font-medium text-text-on-dark">{t('collab_title')}</h3>
          </div>
          <button onClick={() => setCollaborativeMode(false)} className="text-text-on-dark2 hover:text-text-on-dark cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className="text-[10px] text-text-on-dark2/60">{t('collab_subtitle')}</p>
      </div>

      {/* Active session */}
      {activeCollaborator && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-blue-brand/10 border border-blue-brand/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-blue-brand" />
            <span className="text-xs font-medium text-blue-brand">{t('collab_active_session')}</span>
            <Badge variant="green">{t('collab_live')}</Badge>
          </div>
          <p className="text-sm text-text-on-dark">{activeCollaborator.nome}</p>
          <p className="text-[10px] text-text-on-dark2/60">{activeCollaborator.email}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" size="sm" className="!bg-white/5 !text-text-on-dark !border-white/10 hover:!bg-white/10" onClick={handleExitAccess}>
              {t('collab_end')}
            </Button>
          </div>
        </div>
      )}

      {/* Client Access Section */}
      {user?.role === 'support' && !activeCollaborator && (
        <div className="px-3 mt-4">
          <p className="text-[10px] uppercase tracking-wider text-text-on-dark2/50 font-medium mb-2 px-1">{t('collab_clients')}</p>
          <div className="space-y-2">
            {[
              { nome: 'Dr. Carlos Mendes', crm: '123456-SP', status: 'online' },
              { nome: 'Clínica Dermatovita', crm: '789012-RJ', status: 'offline' },
              { nome: 'Dra. Lucia Alvarez', crm: '345678-MG', status: 'online' },
            ].map((client) => (
              <button
                key={client.nome}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-mid/30 flex items-center justify-center text-xs font-medium text-text-on-dark">
                  {client.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-on-dark truncate">{client.nome}</p>
                  <p className="text-[10px] text-text-on-dark2/60">{client.crm}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${client.status === 'online' ? 'bg-success' : 'bg-text-muted'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Collaborators (doctor's view) */}
      {user?.role !== 'support' && (
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] uppercase tracking-wider text-text-on-dark2/50 font-medium">{t('collab_my_collaborators')}</p>
            <Button variant="ghost" size="sm" className="!text-blue-brand !p-0 !h-auto" title={t('collab_add')}>
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
                      {collab.role === 'support' ? t('collab_support') : t('collab_collaborator')}
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
            <strong className="text-text-on-dark">{t('collaborative_central')}:</strong> {t('collab_info')}
          </p>
          <a href="#" className="text-[10px] text-blue-brand mt-2 inline-block hover:underline">{t('collab_learn_more')}</a>
        </div>
      </div>
    </div>
  )
}
