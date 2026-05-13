import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type MockClient } from '../../../store/authStore'
import { useI18n } from '../../../i18n/useI18n'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { Search, Users, Shield, AlertTriangle, CheckCircle, XCircle, Eye, LogOut } from 'lucide-react'

const planStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'green' as const
    case 'trial': return 'amber' as const
    case 'expired': return 'red' as const
    default: return 'blue' as const
  }
}

const planStatusLabel: Record<string, string> = {
  active: 'Ativo',
  trial: 'Trial',
  expired: 'Expirado',
}

export function ProducerDashboard() {
  const { t } = useI18n()
  const { getMockClientList, impersonateClient, restoreFromImpersonation, impersonatedClient, originalUser } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const clients = getMockClientList()
  const filtered = clients.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.crm.toLowerCase().includes(search.toLowerCase())
  )

  const total = clients.length
  const active = clients.filter(c => c.planStatus === 'active').length
  const trial = clients.filter(c => c.planStatus === 'trial').length
  const expired = clients.filter(c => c.planStatus === 'expired').length

  const handleAccessClient = (client: MockClient) => {
    setSelectedClient(client)
    setShowConfirm(true)
  }

  const handleConfirmAccess = () => {
    if (selectedClient) {
      impersonateClient(selectedClient)
      setShowConfirm(false)
      setSelectedClient(null)
      navigate('/dashboard')
    }
  }

  if (impersonatedClient && originalUser) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-brand/10 border border-blue-brand/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-blue-brand" />
            <div>
              <p className="text-sm font-medium text-text-primary">{t('producer_access')}</p>
              <p className="text-xs text-text-secondary">{t('producer_impersonating')} <strong>{impersonatedClient.nome}</strong> ({impersonatedClient.crm})</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { restoreFromImpersonation(); navigate('/produtor') }}>
            <LogOut size={14} /> {t('producer_exit')}
          </Button>
        </div>
        <p className="text-sm text-text-secondary">{t('prod_impersonate_warning')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-medium text-text-primary">{t('prod_title')}</h2>
        <p className="text-sm text-text-secondary mt-1">{t('prod_clients')} ({total})</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Users size={20} className="text-blue-brand" /></div>
            <div><p className="text-sm text-text-secondary">{t('prod_total')}</p><p className="text-xl font-semibold text-text-primary mt-1">{total}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><CheckCircle size={20} className="text-success" /></div>
            <div><p className="text-sm text-text-secondary">{t('prod_active')}</p><p className="text-xl font-semibold text-text-primary mt-1">{active}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-pale flex items-center justify-center"><AlertTriangle size={20} className="text-warning" /></div>
            <div><p className="text-sm text-text-secondary">{t('prod_trial')}</p><p className="text-xl font-semibold text-text-primary mt-1">{trial}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-pale flex items-center justify-center"><XCircle size={20} className="text-danger" /></div>
            <div><p className="text-sm text-text-secondary">{t('prod_expired')}</p><p className="text-xl font-semibold text-text-primary mt-1">{expired}</p></div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('prod_search_placeholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
          />
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 && (
            <p className="text-sm text-text-muted py-8 text-center">{t('noclients')}</p>
          )}
          {filtered.map(client => (
            <div key={client.id} className="flex items-center justify-between py-3 px-2 hover:bg-blue-pale/30 rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-mid/30 flex items-center justify-center text-sm font-medium text-text-primary">
                  {client.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{client.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">{client.email}</span>
                    <span className="text-xs text-text-muted">|</span>
                    <span className="text-xs text-text-muted">{client.crm}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={planStatusVariant(client.planStatus)}>{planStatusLabel[client.planStatus]}</Badge>
                {client.faturamento && (
                  <span className="text-xs font-medium text-text-primary">R$ {client.faturamento.toLocaleString()}</span>
                )}
                <Button variant="secondary" size="sm" onClick={() => handleAccessClient(client)}>
                  <Eye size={14} /> {t('prod_access_client')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title={t('prod_access_client')}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-warning-pale border border-warning/20">
            <Shield size={20} className="text-warning flex-shrink-0" />
            <p className="text-sm text-text-primary">{t('prod_impersonate_warning')}</p>
          </div>

          {selectedClient && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-card-alt">
              <div className="w-10 h-10 rounded-full bg-blue-mid/30 flex items-center justify-center text-sm font-medium">
                {selectedClient.nome.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{selectedClient.nome}</p>
                <p className="text-xs text-text-secondary">{selectedClient.email} · {selectedClient.crm}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>{t('cancelar')}</Button>
            <Button className="flex-1" onClick={handleConfirmAccess}>
              <Shield size={16} /> {t('prod_confirm_access')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
