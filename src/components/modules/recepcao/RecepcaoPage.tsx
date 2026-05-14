import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import { DoorOpen, Clock, Users, Search, CheckCircle, XCircle, UserCheck, UserPlus } from 'lucide-react'

interface WaitingPatient {
  id: string
  nome: string
  chegada: string
  status: 'aguardando' | 'em_consulta' | 'finalizado' | 'faltou'
  prioridade: 'normal' | 'urgencia'
  observacao?: string
}

export function RecepcaoPage() {
  const [waitingList, setWaitingList] = usePersistedState<WaitingPatient[]>('medvante-recepcao', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', prioridade: 'normal' as WaitingPatient['prioridade'], observacao: '' })

  const filtered = waitingList.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  const aguardando = waitingList.filter(p => p.status === 'aguardando')
  const emConsulta = waitingList.filter(p => p.status === 'em_consulta')
  const finalizadosHoje = waitingList.filter(p => p.status === 'finalizado' || p.status === 'faltou')

  const handleCheckin = () => {
    if (!form.nome) return
    const patient: WaitingPatient = {
      id: 'wait-' + Date.now(),
      nome: form.nome,
      chegada: new Date().toISOString(),
      status: 'aguardando',
      prioridade: form.prioridade,
      observacao: form.observacao || undefined,
    }
    setWaitingList(prev => [...prev, patient])
    setForm({ nome: '', prioridade: 'normal', observacao: '' })
    setShowModal(false)
  }

  const handleStatusChange = (id: string, status: WaitingPatient['status']) => {
    setWaitingList(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const handleRemove = (id: string) => {
    if (confirm('Remover este paciente da recepção?')) setWaitingList(prev => prev.filter(p => p.id !== id))
  }

  const getMinAgo = (chegada: string) => {
    const diff = Date.now() - new Date(chegada).getTime()
    return Math.floor(diff / 60000)
  }

  return (
    <PaywallGate feature="clinic" description="Gerencie a recepção da clínica: check-in de pacientes, fila de espera e triagem em tempo real.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Check-in
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Users size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Hoje</p><p className="text-xl font-semibold text-text-primary mt-1">{waitingList.length}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-pale flex items-center justify-center"><Clock size={20} className="text-warning" /></div>
              <div><p className="text-sm text-text-secondary">Em espera</p><p className="text-xl font-semibold text-text-primary mt-1">{aguardando.length}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><DoorOpen size={20} className="text-success" /></div>
              <div><p className="text-sm text-text-secondary">Em consulta</p><p className="text-xl font-semibold text-text-primary mt-1">{emConsulta.length}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-bg-card-alt flex items-center justify-center"><CheckCircle size={20} className="text-text-muted" /></div>
              <div><p className="text-sm text-text-secondary">Finalizados</p><p className="text-xl font-semibold text-text-primary mt-1">{finalizadosHoje.length}</p></div>
            </div>
          </Card>
        </div>

        {/* Fila de espera */}
        <Card header={
          <div className="flex items-center justify-between">
            <span className="font-heading text-base font-medium">Fila de espera</span>
            {aguardando.length > 0 && (
              <Badge variant="amber">{aguardando.length} aguardando</Badge>
            )}
          </div>
        }>
          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">Nenhum paciente na recepção</p>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      p.prioridade === 'urgencia' ? 'bg-danger' : p.status === 'em_consulta' ? 'bg-success' : 'bg-blue-mid'
                    }`}>
                      {p.nome.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{p.nome}</p>
                        {p.prioridade === 'urgencia' && <Badge variant="red">Urgência</Badge>}
                      </div>
                      <p className="text-xs text-text-secondary">
                        {p.status === 'aguardando' && `Chegou há ${getMinAgo(p.chegada)} min`}
                        {p.status === 'em_consulta' && 'Em consulta'}
                        {p.status === 'finalizado' && 'Finalizado'}
                        {p.status === 'faltou' && 'Faltou'}
                        {p.observacao && ` · ${p.observacao}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'aguardando' && (
                      <>
                        <button onClick={() => handleStatusChange(p.id, 'em_consulta')}
                          className="p-1.5 rounded-lg bg-success-pale text-success hover:bg-success/20 transition-colors cursor-pointer" title="Iniciar consulta">
                          <UserCheck size={14} />
                        </button>
                        <button onClick={() => handleStatusChange(p.id, 'faltou')}
                          className="p-1.5 rounded-lg bg-danger-pale text-danger hover:bg-danger/20 transition-colors cursor-pointer" title="Marcar falta">
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    {p.status === 'em_consulta' && (
                      <button onClick={() => handleStatusChange(p.id, 'finalizado')}
                        className="p-1.5 rounded-lg bg-success-pale text-success hover:bg-success/20 transition-colors cursor-pointer" title="Finalizar">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {(p.status === 'finalizado' || p.status === 'faltou') && (
                      <button onClick={() => handleRemove(p.id)}
                        className="p-1.5 rounded-lg bg-bg-card-alt text-text-muted hover:text-danger transition-colors cursor-pointer" title="Remover">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal open={showModal} onClose={() => setShowModal(false)} title="Check-in de paciente">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nome do paciente *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Prioridade</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-blue-pale/30 flex-1">
                  <input type="radio" name="prioridade" checked={form.prioridade === 'normal'} onChange={() => setForm(p => ({ ...p, prioridade: 'normal' }))} className="accent-blue-brand" />
                  <span className="text-sm">Normal</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-danger-pale/30 flex-1">
                  <input type="radio" name="prioridade" checked={form.prioridade === 'urgencia'} onChange={() => setForm(p => ({ ...p, prioridade: 'urgencia' }))} className="accent-danger" />
                  <span className="text-sm text-danger">Urgência</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Observação</label>
              <textarea value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={!form.nome} onClick={handleCheckin}>Fazer check-in</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}