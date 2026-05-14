import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import { toast } from '../../../hooks/useToast'
import type { PricingRule } from '../../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function PrecificacaoPage() {
  const [rules, setRules] = usePersistedState<PricingRule[]>('medvante-precificacao', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ procedimento: '', custoInsumos: '', custoOperacional: '', margemLucro: '', valorPraticado: '', categoria: '' })

  const filtered = rules.filter(r =>
    r.procedimento.toLowerCase().includes(search.toLowerCase()) ||
    r.categoria.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => setForm({ procedimento: '', custoInsumos: '', custoOperacional: '', margemLucro: '', valorPraticado: '', categoria: '' })

  const handleSave = () => {
    if (!form.procedimento) { toast('Informe o nome do procedimento', 'error'); return }
    const custoInsumos = parseFloat(form.custoInsumos) || 0
    const custoOperacional = parseFloat(form.custoOperacional) || 0
    const margemLucro = parseFloat(form.margemLucro) || 0
    const custoTotal = custoInsumos + custoOperacional
    const valorSugerido = custoTotal * (1 + margemLucro / 100)
    const rule: PricingRule = {
      id: editId || 'preco-' + Date.now(),
      procedimento: form.procedimento,
      custoInsumos,
      custoOperacional,
      margemLucro,
      valorSugerido: Math.round(valorSugerido * 100) / 100,
      valorPraticado: parseFloat(form.valorPraticado) || Math.round(valorSugerido * 100) / 100,
      categoria: form.categoria,
    }
    if (editId) {
      setRules(prev => prev.map(r => r.id === editId ? rule : r))
      toast('Precificação atualizada', 'success')
    } else {
      setRules(prev => [...prev, rule])
      toast('Precificação criada', 'success')
    }
    setShowModal(false); setEditId(null); resetForm()
  }

  const handleEdit = (r: PricingRule) => {
    setForm({
      procedimento: r.procedimento,
      custoInsumos: String(r.custoInsumos),
      custoOperacional: String(r.custoOperacional),
      margemLucro: String(r.margemLucro),
      valorPraticado: String(r.valorPraticado),
      categoria: r.categoria,
    })
    setEditId(r.id)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir regra de precificação?')) {
      setRules(prev => prev.filter(r => r.id !== id))
      toast('Regra excluída', 'info')
    }
  }

  return (
    <PaywallGate feature="pro" description="Defina preços automáticos para procedimentos com base em custos e margem de lucro.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar procedimento..." className="w-full pl-3 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}>
            <Plus size={16} /> Nova precificação
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><p className="text-sm text-text-secondary">Procedimentos</p><p className="text-xl font-semibold text-text-primary mt-1">{rules.length}</p></Card>
          <Card><p className="text-sm text-text-secondary">Custo médio</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {(rules.reduce((a, b) => a + b.custoInsumos + b.custoOperacional, 0) / (rules.length || 1)).toFixed(2)}</p></Card>
          <Card><p className="text-sm text-text-secondary">Margem média</p><p className="text-xl font-semibold text-success mt-1">{(rules.reduce((a, b) => a + b.margemLucro, 0) / (rules.length || 1)).toFixed(1)}%</p></Card>
          <Card><p className="text-sm text-text-secondary">Receita potencial</p><p className="text-xl font-semibold text-blue-brand mt-1">R$ {rules.reduce((a, b) => a + b.valorPraticado, 0).toFixed(2)}</p></Card>
        </div>

        <Card>
          <table className="w-full border-collapse">
            <thead><tr className="bg-bg-card-alt">
              {['Procedimento', 'Categoria', 'Custo Insumos', 'Custo Operacional', 'Margem', 'Sugerido', 'Praticado', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma regra cadastrada</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-blue-pale transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.procedimento}</td>
                    <td className="px-4 py-3"><Badge variant="blue">{r.categoria || '—'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-primary">R$ {r.custoInsumos.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">R$ {r.custoOperacional.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-success">{r.margemLucro}%</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">R$ {r.valorSugerido.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {r.valorPraticado.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(r)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Pencil size={14} className="text-text-muted" /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); resetForm() }}
          title={editId ? 'Editar precificação' : 'Nova precificação'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-text-primary mb-1">Procedimento *</label>
                <input value={form.procedimento} onChange={e => setForm(p => ({ ...p, procedimento: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
              <div><label className="block text-sm font-medium text-text-primary mb-1">Categoria</label>
                <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="">Selecionar</option>
                  <option value="Injetáveis">Injetáveis</option>
                  <option value="Consultas">Consultas</option>
                  <option value="Exames">Exames</option>
                  <option value="Procedimentos">Procedimentos</option>
                  <option value="Cirurgias">Cirurgias</option>
                </select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium text-text-primary mb-1">Custo Insumos (R$)</label>
                <input type="number" step="0.01" value={form.custoInsumos} onChange={e => setForm(p => ({ ...p, custoInsumos: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
              <div><label className="block text-sm font-medium text-text-primary mb-1">Custo Operacional (R$)</label>
                <input type="number" step="0.01" value={form.custoOperacional} onChange={e => setForm(p => ({ ...p, custoOperacional: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
              <div><label className="block text-sm font-medium text-text-primary mb-1">Margem (%)</label>
                <input type="number" step="0.1" value={form.margemLucro} onChange={e => setForm(p => ({ ...p, margemLucro: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor praticado (R$)</label>
              <input type="number" step="0.01" value={form.valorPraticado} onChange={e => setForm(p => ({ ...p, valorPraticado: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              <p className="text-xs text-text-muted mt-1">Deixe em branco para usar o valor sugerido automaticamente</p>
            </div>
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
