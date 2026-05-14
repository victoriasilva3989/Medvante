import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { TeamMember } from '../../../types'
import { useComissionamentoStore } from '../../../store/comissionamentoStore'
import { Users, UserPlus, Search, Pencil, Trash2, DollarSign } from 'lucide-react'

export function EquipePage() {
  const [team, setTeam] = usePersistedState<TeamMember[]>('medvante-equipe', [])
  const { rules } = useComissionamentoStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', cargo: '', email: '', telefone: '', salario: '', comissao: '' })

  const resetForm = () => setForm({ nome: '', cargo: '', email: '', telefone: '', salario: '', comissao: '' })

  const filtered = team.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.cargo.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const folhaTotal = team.filter(m => m.ativo).reduce((a, b) => a + b.salario, 0)
  const comissaoTotal = team.filter(m => m.ativo && m.comissao).reduce((a, b) => a + (b.comissao || 0), 0)

  const handleEdit = (m: TeamMember) => {
    setForm({ nome: m.nome, cargo: m.cargo, email: m.email, telefone: m.telefone || '', salario: String(m.salario), comissao: m.comissao ? String(m.comissao) : '' })
    setEditId(m.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nome || !form.cargo || !form.email) return
    const member: TeamMember = {
      id: editId || 'eq-' + Date.now(),
      nome: form.nome,
      cargo: form.cargo,
      email: form.email,
      telefone: form.telefone || undefined,
      dataContratacao: editId ? (team.find(m => m.id === editId)?.dataContratacao || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      salario: parseFloat(form.salario) || 0,
      comissao: form.comissao ? parseFloat(form.comissao) : undefined,
      ativo: editId ? (team.find(m => m.id === editId)?.ativo ?? true) : true,
    }
    if (editId) {
      setTeam(prev => prev.map(m => m.id === editId ? member : m))
    } else {
      setTeam(prev => [...prev, member])
    }
    setShowModal(false)
    setEditId(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este membro da equipe?')) setTeam(prev => prev.filter(m => m.id !== id))
  }

  const handleToggleAtivo = (id: string) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m))
  }

  return (
    <PaywallGate feature="clinic" description="Gerencie sua equipe, cargos, salários, comissões e comunicação interna com chat integrado.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar membro..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button variant="primary" onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}>
            <UserPlus size={16} /> Novo membro
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <Users size={20} className="text-blue-brand" />
              <div><p className="text-sm text-text-secondary">Total</p><p className="text-xl font-semibold text-text-primary mt-1">{team.length}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-success" />
              <div><p className="text-sm text-text-secondary">Folha de pagamento</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {folhaTotal.toFixed(2)}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-warning" />
              <div><p className="text-sm text-text-secondary">Custo comissões</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {comissaoTotal.toFixed(2)}</p></div>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Regras de comissão</p>
            <p className="text-xl font-semibold text-text-primary mt-1">{rules.length}</p>
          </Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Equipe</span>}>
          <Table headers={['Nome', 'Cargo', 'Email', 'Telefone', 'Salário', 'Comissão', 'Status', 'Ações']}>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum membro encontrado</td></tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{m.nome}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.cargo}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.email}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.telefone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">R$ {m.salario.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.comissao ? `${m.comissao}%` : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleAtivo(m.id)} className="cursor-pointer">
                      <Badge variant={m.ativo ? 'green' : 'red'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(m)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Pencil size={14} className="text-text-muted" /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Trash2 size={14} className="text-danger" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); resetForm() }}
          title={editId ? 'Editar membro' : 'Novo membro'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Cargo *</label>
                <select value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="">Selecionar</option>
                  <option value="Médico(a)">Médico(a)</option>
                  <option value="Enfermeiro(a)">Enfermeiro(a)</option>
                  <option value="Secretário(a)">Secretário(a)</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Telefone</label>
                <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Salário (R$)</label>
                <input type="number" step="0.01" min="0" value={form.salario} onChange={e => setForm(p => ({ ...p, salario: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Comissão (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={form.comissao} onChange={e => setForm(p => ({ ...p, comissao: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditId(null); resetForm() }}>Cancelar</Button>
              <Button className="flex-1" disabled={!form.nome || !form.cargo || !form.email} onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}