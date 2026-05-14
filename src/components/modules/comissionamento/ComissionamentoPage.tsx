import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { useComissionamentoStore } from '../../../store/comissionamentoStore'
import type { CommissionRule } from '../../../types'
import { Plus, Pencil, Trash2, DollarSign, Percent, CheckCircle, Calculator } from 'lucide-react'

export function ComissionamentoPage() {
  const { rules, commissions, addRule, updateRule, removeRule, addCommission, payCommission, calculateCommissions } = useComissionamentoStore()
  const [tab, setTab] = useState('regras')
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showCalcModal, setShowCalcModal] = useState(false)
  const [editRuleId, setEditRuleId] = useState<string | null>(null)
  const [calcForm, setCalcForm] = useState({ profissionalId: '', profissionalNome: '', periodo: '', valorBase: '' })
  const [form, setForm] = useState({ profissionalNome: '', tipo: 'percentual' as 'percentual' | 'fixo', valor: '', procedimentos: '' })

  const resetForm = () => setForm({ profissionalNome: '', tipo: 'percentual', valor: '', procedimentos: '' })

  const handleEditRule = (r: CommissionRule) => {
    setForm({ profissionalNome: r.profissionalNome, tipo: r.tipo, valor: String(r.valor), procedimentos: r.procedimentos.join(', ') })
    setEditRuleId(r.id)
    setShowRuleModal(true)
  }

  const handleSaveRule = () => {
    if (!form.profissionalNome || !form.valor) return
    const rule: CommissionRule = {
      id: editRuleId || 'rule-' + Date.now(),
      profissionalId: editRuleId ? (rules.find(r => r.id === editRuleId)?.profissionalId || '') : ('prof-' + Date.now()),
      profissionalNome: form.profissionalNome,
      tipo: form.tipo,
      valor: parseFloat(form.valor) || 0,
      procedimentos: form.procedimentos.split(',').map(s => s.trim()).filter(Boolean),
      ativo: editRuleId ? (rules.find(r => r.id === editRuleId)?.ativo ?? true) : true,
    }
    if (editRuleId) {
      updateRule(editRuleId, rule)
    } else {
      addRule(rule)
    }
    setShowRuleModal(false)
    setEditRuleId(null)
    resetForm()
  }

  const handleDeleteRule = (id: string) => {
    if (confirm('Excluir esta regra de comissão?')) removeRule(id)
  }

  const handleCalculate = () => {
    if (!calcForm.profissionalNome || !calcForm.valorBase || !calcForm.periodo) return
    const result = calculateCommissions(
      calcForm.periodo,
      parseFloat(calcForm.valorBase),
      '',
      calcForm.profissionalNome
    )
    if (result) {
      addCommission(result)
      alert(`Comissão calculada: R$ ${result.valorComissao.toFixed(2)} para ${result.profissionalNome}`)
    } else {
      alert('Nenhuma regra de comissão encontrada para este profissional. Crie uma regra primeiro.')
    }
    setShowCalcModal(false)
    setCalcForm({ profissionalId: '', profissionalNome: '', periodo: '', valorBase: '' })
  }

  const pendingCommissions = commissions.filter(c => c.status !== 'pago')
  const paidCommissions = commissions.filter(c => c.status === 'pago')

  return (
    <PaywallGate feature="pro" description="Configure regras de comissionamento para sua equipe e acompanhe os cálculos automáticos.">
      <div className="space-y-6">
        <Tabs
          tabs={[
            { key: 'regras', label: 'Regras', icon: <Percent size={16} /> },
            { key: 'comissoes', label: 'Comissões', icon: <DollarSign size={16} /> },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'regras' && (
          <>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => { setEditRuleId(null); resetForm(); setShowRuleModal(true) }}>
                <Plus size={16} /> Nova regra
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card><p className="text-sm text-text-secondary">Regras ativas</p><p className="text-xl font-semibold text-text-primary mt-1">{rules.filter(r => r.ativo).length}</p></Card>
              <Card><p className="text-sm text-text-secondary">Profissionais com regra</p><p className="text-xl font-semibold text-text-primary mt-1">{new Set(rules.map(r => r.profissionalNome)).size}</p></Card>
              <Card><p className="text-sm text-text-secondary">Total inativas</p><p className="text-xl font-semibold text-danger mt-1">{rules.filter(r => !r.ativo).length}</p></Card>
            </div>
            <Card header={<span className="font-heading text-base font-medium">Regras de comissionamento</span>}>
              <table className="w-full border-collapse">
                <thead><tr className="bg-bg-card-alt">
                  {['Profissional', 'Tipo', 'Valor', 'Procedimentos', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {rules.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma regra cadastrada</td></tr>
                  ) : (
                    rules.map(r => (
                      <tr key={r.id} className="hover:bg-blue-pale transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.profissionalNome}</td>
                        <td className="px-4 py-3">
                          <Badge variant={r.tipo === 'percentual' ? 'blue' : 'gold'}>{r.tipo === 'percentual' ? 'Percentual' : 'Valor fixo'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {r.tipo === 'percentual' ? `${r.valor}%` : `R$ ${r.valor.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{r.procedimentos.join(', ') || 'Todos'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => updateRule(r.id, { ativo: !r.ativo })} className="cursor-pointer">
                            <Badge variant={r.ativo ? 'green' : 'red'}>{r.ativo ? 'Ativo' : 'Inativo'}</Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditRule(r)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Pencil size={14} className="text-text-muted" /></button>
                            <button onClick={() => handleDeleteRule(r.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Trash2 size={14} className="text-danger" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {tab === 'comissoes' && (
          <>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setShowCalcModal(true)}>
                <Calculator size={16} /> Calcular comissão
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card><p className="text-sm text-text-secondary">Total a pagar</p><p className="text-xl font-semibold text-text-primary mt-1">
                R$ {pendingCommissions.reduce((a, b) => a + b.valorComissao, 0).toFixed(2)}
              </p></Card>
              <Card><p className="text-sm text-text-secondary">Comissões pendentes</p><p className="text-xl font-semibold text-warning mt-1">{pendingCommissions.length}</p></Card>
              <Card><p className="text-sm text-text-secondary">Comissões pagas</p><p className="text-xl font-semibold text-success mt-1">{paidCommissions.length}</p></Card>
            </div>

            <Card header={<span className="font-heading text-base font-medium">Comissões calculadas</span>}>
              <table className="w-full border-collapse">
                <thead><tr className="bg-bg-card-alt">
                  {['Profissional', 'Período', 'Valor base', '%', 'Comissão', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {commissions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma comissão calculada</td></tr>
                  ) : (
                    commissions.sort((a, b) => a.periodo.localeCompare(b.periodo)).map(c => (
                      <tr key={c.id} className="hover:bg-blue-pale transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.profissionalNome}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{c.periodo}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">R$ {c.valorBase.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{c.percentual}%</td>
                        <td className="px-4 py-3 text-sm font-medium text-success">R$ {c.valorComissao.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={c.status === 'pago' ? 'green' : c.status === 'calculado' ? 'blue' : 'amber'}>{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {c.status !== 'pago' && (
                            <button onClick={() => payCommission(c.id)}
                              className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Pagar">
                              <CheckCircle size={14} className="text-success" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>

      {/* Rule Modal */}
      <Modal open={showRuleModal} onClose={() => { setShowRuleModal(false); setEditRuleId(null); resetForm() }}
        title={editRuleId ? 'Editar regra' : 'Nova regra'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Profissional *</label>
            <input value={form.profissionalNome} onChange={e => setForm(p => ({ ...p, profissionalNome: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as 'percentual' | 'fixo' }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{form.tipo === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'} *</label>
              <input type="number" step="0.01" min="0" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Procedimentos (separados por vírgula)</label>
            <input value={form.procedimentos} onChange={e => setForm(p => ({ ...p, procedimentos: e.target.value }))}
              placeholder="Consulta, Exame, Cirurgia" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            <p className="text-xs text-text-muted mt-1">Deixe em branco para aplicar a todos os procedimentos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowRuleModal(false); setEditRuleId(null); resetForm() }}>Cancelar</Button>
            <Button className="flex-1" disabled={!form.profissionalNome || !form.valor} onClick={handleSaveRule}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Calculate Modal */}
      <Modal open={showCalcModal} onClose={() => setShowCalcModal(false)} title="Calcular comissão">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Profissional *</label>
            <input value={calcForm.profissionalNome} onChange={e => setCalcForm(p => ({ ...p, profissionalNome: e.target.value }))}
              list="profissionais-list"
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            <datalist id="profissionais-list">
              {rules.map(r => <option key={r.id} value={r.profissionalNome} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Período *</label>
              <input value={calcForm.periodo} onChange={e => setCalcForm(p => ({ ...p, periodo: e.target.value }))}
                placeholder="Ex: Maio/2026" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor base (R$) *</label>
              <input type="number" step="0.01" min="0" value={calcForm.valorBase} onChange={e => setCalcForm(p => ({ ...p, valorBase: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCalcModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!calcForm.profissionalNome || !calcForm.valorBase || !calcForm.periodo} onClick={handleCalculate}>
              <Calculator size={14} /> Calcular
            </Button>
          </div>
        </div>
      </Modal>
    </PaywallGate>
  )
}