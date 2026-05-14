import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { Budget } from '../../../types'
import { Plus, Pencil, Trash2, Search, DollarSign, Eye } from 'lucide-react'

const statusVariant: Record<string, 'green' | 'blue' | 'red' | 'gold'> = {
  aprovado: 'green', orçamento: 'blue', recusado: 'red', convertido: 'gold',
}

export function OrcamentosPage() {
  const [budgets, setBudgets] = usePersistedState<Budget[]>('medvante-orcamentos', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState<string | null>(null)
  const [form, setForm] = useState({ paciente: '', procedimentos: '', valorTotal: '', data: '', validade: '', observacao: '' })

  const today = new Date().toISOString().split('T')[0]
  const resetForm = () => setForm({ paciente: '', procedimentos: '', valorTotal: '', data: today, validade: '', observacao: '' })

  const filtered = budgets.filter(b =>
    b.paciente.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = budgets.reduce((a, b) => a + b.valorTotal, 0)
  const aprovados = budgets.filter(b => b.status === 'aprovado' || b.status === 'convertido')
  const taxaConversao = budgets.length > 0 ? (aprovados.length / budgets.length * 100) : 0

  const handleEdit = (b: Budget) => {
    setForm({
      paciente: b.paciente,
      procedimentos: b.procedimentos.map(p => `${p.nome}:R$${p.valor}`).join('; '),
      valorTotal: String(b.valorTotal),
      data: b.data,
      validade: b.validade,
      observacao: b.observacao || '',
    })
    setEditId(b.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.paciente || !form.valorTotal) return
    const procs = form.procedimentos.split(';').filter(Boolean).map(s => {
      const parts = s.trim().split(':R$')
      return { nome: parts[0] || s.trim(), valor: parts[1] ? parseFloat(parts[1]) : 0 }
    })
    const budget: Budget = {
      id: editId || 'orc-' + Date.now(),
      paciente: form.paciente,
      procedimentos: procs.length > 0 ? procs : [{ nome: form.procedimentos || 'Procedimento', valor: parseFloat(form.valorTotal) || 0 }],
      valorTotal: parseFloat(form.valorTotal) || 0,
      data: form.data || today,
      validade: form.validade,
      status: editId ? (budgets.find(b => b.id === editId)?.status || 'orçamento') : 'orçamento',
      observacao: form.observacao || undefined,
    }
    if (editId) {
      setBudgets(prev => prev.map(b => b.id === editId ? budget : b))
    } else {
      setBudgets(prev => [...prev, budget])
    }
    setShowModal(false)
    setEditId(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este orçamento?')) setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const handleStatusChange = (id: string, status: Budget['status']) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  return (
    <PaywallGate feature="pro" description="Crie orçamentos profissionais, acompanhe aprovações e converta em atendimento com um clique.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button variant="primary" onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}>
            <Plus size={16} /> Novo orçamento
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><DollarSign size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Total em orçamentos</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {totalValue.toFixed(2)}</p></div>
            </div>
          </Card>
          <Card><p className="text-sm text-text-secondary">Orçamentos</p><p className="text-xl font-semibold text-text-primary mt-1">{budgets.length}</p></Card>
          <Card><p className="text-sm text-text-secondary">Aprovados</p><p className="text-xl font-semibold text-success mt-1">{aprovados.length}</p></Card>
          <Card><p className="text-sm text-text-secondary">Taxa de conversão</p><p className="text-xl font-semibold text-text-primary mt-1">{taxaConversao.toFixed(0)}%</p></Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Orçamentos</span>}>
          <Table headers={['Paciente', 'Procedimentos', 'Valor Total', 'Data', 'Validade', 'Status', 'Ações']}>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum orçamento encontrado</td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.paciente}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {b.procedimentos.map(p => p.nome).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {b.valorTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.data}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.validade}</td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={e => handleStatusChange(b.id, e.target.value as Budget['status'])}
                      className="text-xs rounded-lg border border-border-strong px-2 py-1 outline-none focus:border-blue-brand cursor-pointer">
                      <option value="orçamento">Orçamento</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="recusado">Recusado</option>
                      <option value="convertido">Convertido</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(b)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Editar">
                        <Pencil size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => setShowDetail(showDetail === b.id ? null : b.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Detalhes">
                        <Eye size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Excluir">
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>

        {/* Detail view */}
        {showDetail && budgets.filter(b => b.id === showDetail).map(b => (
          <Card key={b.id} header={<span className="font-heading text-base font-medium">Detalhes: {b.paciente}</span>}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-text-muted">Paciente</p><p className="text-sm font-medium text-text-primary">{b.paciente}</p></div>
                <div><p className="text-xs text-text-muted">Valor total</p><p className="text-sm font-medium text-text-primary">R$ {b.valorTotal.toFixed(2)}</p></div>
                <div><p className="text-xs text-text-muted">Data</p><p className="text-sm text-text-primary">{b.data}</p></div>
                <div><p className="text-xs text-text-muted">Validade</p><p className="text-sm text-text-primary">{b.validade}</p></div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">Procedimentos</p>
                <table className="w-full text-sm">
                  <thead><tr className="bg-bg-card-alt"><th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Procedimento</th><th className="px-3 py-2 text-right text-xs font-medium text-text-muted">Valor</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {b.procedimentos.map((p, i) => (
                      <tr key={i}><td className="px-3 py-2 text-text-primary">{p.nome}</td><td className="px-3 py-2 text-right text-text-primary">R$ {p.valor.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {b.observacao && <div><p className="text-xs text-text-muted">Observação</p><p className="text-sm text-text-secondary">{b.observacao}</p></div>}
              <Badge variant={statusVariant[b.status] || 'blue'}>{b.status}</Badge>
            </div>
          </Card>
        ))}

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); resetForm() }}
          title={editId ? 'Editar orçamento' : 'Novo orçamento'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente *</label>
              <input value={form.paciente} onChange={e => setForm(p => ({ ...p, paciente: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Procedimentos</label>
              <textarea value={form.procedimentos} onChange={e => setForm(p => ({ ...p, procedimentos: e.target.value }))}
                placeholder="Ex: Consulta:R$350; Exame:R$200"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              <p className="text-xs text-text-muted mt-1">Formato: Nome:R$Valor; separados por ponto e vírgula</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Valor total (R$) *</label>
                <input type="number" step="0.01" min="0" value={form.valorTotal} onChange={e => setForm(p => ({ ...p, valorTotal: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Data</label>
                <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Validade</label>
                <input type="date" value={form.validade} onChange={e => setForm(p => ({ ...p, validade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Observação</label>
              <textarea value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditId(null); resetForm() }}>Cancelar</Button>
              <Button className="flex-1" disabled={!form.paciente || !form.valorTotal} onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}