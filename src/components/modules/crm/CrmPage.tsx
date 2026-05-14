import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Table } from '../../ui/Table'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import { toast } from '../../../hooks/useToast'
import { Search, Phone, Mail, MessageSquare, CheckCircle, XCircle, UserPlus, Trash2 } from 'lucide-react'

interface Lead {
  id: string
  nome: string
  telefone: string
  email: string
  origem: 'whatsapp' | 'indicacao' | 'site' | 'presencial'
  etapa: 'novo' | 'contatado' | 'agendado' | 'convertido' | 'perdido'
  observacoes: string
  data: string
  ultimoContato?: string
}

const etapaOrdem: Record<string, number> = { novo: 0, contatado: 1, agendado: 2, convertido: 3, perdido: 4 }

export function CrmPage() {
  const [leads, setLeads] = usePersistedState<Lead[]>('medvante-crm', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', origem: 'whatsapp' as Lead['origem'], observacoes: '' })

  const filtered = leads.filter(l =>
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    l.telefone.includes(search) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (etapaOrdem[a.etapa] || 0) - (etapaOrdem[b.etapa] || 0))

  const resetForm = () => setForm({ nome: '', telefone: '', email: '', origem: 'whatsapp', observacoes: '' })

  const handleSave = () => {
    if (!form.nome) { toast('Informe o nome do lead', 'error'); return }
    const lead: Lead = {
      id: editId || 'lead-' + Date.now(),
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      origem: form.origem,
      etapa: editId ? (leads.find(l => l.id === editId)?.etapa || 'novo') : 'novo',
      observacoes: form.observacoes,
      data: new Date().toISOString().split('T')[0],
      ultimoContato: undefined,
    }
    if (editId) {
      setLeads(prev => prev.map(l => l.id === editId ? { ...l, ...lead } : l))
      toast('Lead atualizado', 'success')
    } else {
      setLeads(prev => [...prev, lead])
      toast('Lead cadastrado', 'success')
    }
    setShowModal(false); setEditId(null); resetForm()
  }

  const handleAvancar = (id: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      const etapas: Lead['etapa'][] = ['novo', 'contatado', 'agendado', 'convertido']
      const idx = etapas.indexOf(l.etapa)
      const novaEtapa = idx < etapas.length - 1 ? etapas[idx + 1] : l.etapa
      return { ...l, etapa: novaEtapa, ultimoContato: new Date().toISOString().split('T')[0] }
    }))
    toast('Lead avançou de etapa', 'success')
  }

  const handlePerder = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa: 'perdido' as const } : l))
    toast('Lead marcado como perdido', 'info')
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este lead?')) {
      setLeads(prev => prev.filter(l => l.id !== id))
      toast('Lead excluído', 'info')
    }
  }

  const stats = {
    novos: leads.filter(l => l.etapa === 'novo').length,
    contatados: leads.filter(l => l.etapa === 'contatado').length,
    agendados: leads.filter(l => l.etapa === 'agendado').length,
    convertidos: leads.filter(l => l.etapa === 'convertido').length,
    perdidos: leads.filter(l => l.etapa === 'perdido').length,
    conversao: leads.length > 0 ? Math.round(leads.filter(l => l.etapa === 'convertido').length / leads.length * 100) : 0,
  }

  return (
    <PaywallGate feature="pro" description="Gerencie leads e oportunidades de novos pacientes.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar lead..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}>
            <UserPlus size={16} /> Novo lead
          </Button>
        </div>

        <div className="grid grid-cols-6 gap-3">
          <Card><p className="text-xs text-text-secondary">Novos</p><p className="text-lg font-semibold text-text-primary">{stats.novos}</p></Card>
          <Card><p className="text-xs text-text-secondary">Contatados</p><p className="text-lg font-semibold text-warning">{stats.contatados}</p></Card>
          <Card><p className="text-xs text-text-secondary">Agendados</p><p className="text-lg font-semibold text-blue-brand">{stats.agendados}</p></Card>
          <Card><p className="text-xs text-text-secondary">Convertidos</p><p className="text-lg font-semibold text-success">{stats.convertidos}</p></Card>
          <Card><p className="text-xs text-text-secondary">Perdidos</p><p className="text-lg font-semibold text-danger">{stats.perdidos}</p></Card>
          <Card><p className="text-xs text-text-secondary">Conversão</p><p className="text-lg font-semibold text-text-primary">{stats.conversao}%</p></Card>
        </div>

        <Card>
          <Table headers={['Nome', 'Contato', 'Origem', 'Etapa', 'Data', 'Último Contato', 'Ações']}>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum lead cadastrado</td></tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{l.nome}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Phone size={12} /> {l.telefone || '—'}
                      {l.email && <><Mail size={12} /> {l.email}</>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="blue">{l.origem}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={l.etapa === 'convertido' ? 'green' : l.etapa === 'perdido' ? 'red' : l.etapa === 'agendado' ? 'blue' : l.etapa === 'contatado' ? 'amber' : 'gold'}>
                      {l.etapa}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{l.data}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{l.ultimoContato || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {l.etapa !== 'convertido' && l.etapa !== 'perdido' && (
                        <button onClick={() => handleAvancar(l.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Avançar etapa">
                          <CheckCircle size={14} className="text-success" />
                        </button>
                      )}
                      {l.etapa !== 'perdido' && (
                        <button onClick={() => handlePerder(l.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Perder lead">
                          <XCircle size={14} className="text-danger" />
                        </button>
                      )}
                      <button onClick={() => { setForm({ nome: l.nome, telefone: l.telefone, email: l.email, origem: l.origem, observacoes: l.observacoes }); setEditId(l.id); setShowModal(true) }}
                        className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Editar">
                        <MessageSquare size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => handleDelete(l.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Excluir">
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); resetForm() }}
          title={editId ? 'Editar lead' : 'Novo lead'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
              <div><label className="block text-sm font-medium text-text-primary mb-1">Telefone</label>
                <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
              <div><label className="block text-sm font-medium text-text-primary mb-1">Origem</label>
                <select value={form.origem} onChange={e => setForm(p => ({ ...p, origem: e.target.value as Lead['origem'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="indicacao">Indicação</option>
                  <option value="site">Site</option>
                  <option value="presencial">Presencial</option>
                </select></div>
            </div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
              <textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
                rows={3} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditId(null); resetForm() }}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}
