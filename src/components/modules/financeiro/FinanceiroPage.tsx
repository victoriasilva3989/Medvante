import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { usePersistedState } from '../../../hooks/usePersistedState'
import { mockExtratoBancario } from '../../../data/contas'
import type { ContaReceber, ContaPagar } from '../../../data/contas'
import { useI18n } from '../../../i18n/useI18n'
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, XCircle, Plus, Search, RefreshCw,
  Banknote, Calendar, Clock, FileText, PiggyBank
} from 'lucide-react'

const statusVariant: Record<string, 'green' | 'amber' | 'red' | 'blue' | 'gold'> = {
  recebido: 'green', pago: 'green', conciliado: 'green', ativo: 'green',
  pendente: 'amber', parcial: 'blue', atrasado: 'red', divergente: 'red',
  aberta: 'amber', contestada: 'blue', reembolsada: 'green', perdida: 'red',
}

export function FinanceiroPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState('visao-geral')

  const [contasReceber, setContasReceber] = usePersistedState<ContaReceber[]>('medvante-contas-receber', [])
  const [contasPagar, setContasPagar] = usePersistedState<ContaPagar[]>('medvante-contas-pagar', [])
  const [extrato] = useState(mockExtratoBancario)

  const [showReceberModal, setShowReceberModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state for Contas a Receber
  const [recForm, setRecForm] = useState({ paciente: '', valor: '', procedimento: '', tipo: 'particular' as 'particular' | 'convenio', convenio: '', emissao: '', vencimento: '' })

  // Form state for Contas a Pagar
  const [pagForm, setPagForm] = useState({ descricao: '', valor: '', categoria: '', vencimento: '', fornecedor: '' })

  const [recSearch, setRecSearch] = useState('')
  const [pagSearch, setPagSearch] = useState('')

  // Visão Geral calculations from local state
  const receitas = contasReceber.filter(c => c.status === 'recebido').reduce((a, b) => a + b.valor, 0)
  const despesas = contasPagar.filter(c => c.status === 'pago').reduce((a, b) => a + b.valor, 0)
  const saldo = receitas - despesas
  const pendenteReceber = contasReceber.filter(c => c.status === 'pendente' || c.status === 'parcial' || c.status === 'atrasado').reduce((a, b) => a + b.valor, 0)
  const pendentePagar = contasPagar.filter(c => c.status === 'pendente' || c.status === 'parcial' || c.status === 'atrasado').reduce((a, b) => a + b.valor, 0)
  const atrasoCritico = contasReceber.filter(c => c.diasAtraso >= 90)
  const saldoProjetado = saldo + pendenteReceber - pendentePagar

  // Contas a Receber CRUD
  const handleAddReceber = () => {
    const nova: ContaReceber = {
      id: 'cr' + Date.now(),
      paciente: recForm.paciente,
      valor: parseFloat(recForm.valor) || 0,
      procedimento: recForm.procedimento,
      tipo: recForm.tipo,
      convenio: recForm.tipo === 'convenio' ? recForm.convenio : undefined,
      emissao: recForm.emissao,
      vencimento: recForm.vencimento,
      status: 'pendente',
      diasAtraso: 0,
    }
    if (editId) {
      setContasReceber(prev => prev.map(c => c.id === editId ? { ...c, ...nova } : c))
    } else {
      setContasReceber(prev => [...prev, nova])
    }
    setShowReceberModal(false)
    setEditId(null)
    setRecForm({ paciente: '', valor: '', procedimento: '', tipo: 'particular', convenio: '', emissao: '', vencimento: '' })
  }

  const handleEditReceber = (c: ContaReceber) => {
    setRecForm({ paciente: c.paciente, valor: String(c.valor), procedimento: c.procedimento, tipo: c.tipo, convenio: c.convenio || '', emissao: c.emissao, vencimento: c.vencimento })
    setEditId(c.id)
    setShowReceberModal(true)
  }

  const handleDeleteReceber = (id: string) => {
    setContasReceber(prev => prev.filter(c => c.id !== id))
  }

  const handleToggleReceberStatus = (id: string) => {
    setContasReceber(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'recebido' ? 'pendente' : 'recebido', diasAtraso: c.status === 'recebido' ? c.diasAtraso : 0 } : c))
  }

  // Contas a Pagar CRUD
  const handleAddPagar = () => {
    const nova: ContaPagar = {
      id: 'cp' + Date.now(),
      descricao: pagForm.descricao,
      valor: parseFloat(pagForm.valor) || 0,
      categoria: pagForm.categoria,
      vencimento: pagForm.vencimento,
      fornecedor: pagForm.fornecedor,
      status: 'pendente',
      diasAtraso: 0,
    }
    if (editId) {
      setContasPagar(prev => prev.map(c => c.id === editId ? { ...c, ...nova } : c))
    } else {
      setContasPagar(prev => [...prev, nova])
    }
    setShowPagarModal(false)
    setEditId(null)
    setPagForm({ descricao: '', valor: '', categoria: '', vencimento: '', fornecedor: '' })
  }

  const handleEditPagar = (c: ContaPagar) => {
    setPagForm({ descricao: c.descricao, valor: String(c.valor), categoria: c.categoria, vencimento: c.vencimento, fornecedor: c.fornecedor })
    setEditId(c.id)
    setShowPagarModal(true)
  }

  const handleDeletePagar = (id: string) => {
    setContasPagar(prev => prev.filter(c => c.id !== id))
  }

  const handleTogglePagarStatus = (id: string) => {
    setContasPagar(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'pago' ? 'pendente' : 'pago', diasAtraso: c.status === 'pago' ? c.diasAtraso : 0 } : c))
  }

  // Conciliação

  const filteredReceber = contasReceber.filter(c =>
    c.paciente.toLowerCase().includes(recSearch.toLowerCase()) ||
    c.procedimento.toLowerCase().includes(recSearch.toLowerCase()) ||
    (c.convenio || '').toLowerCase().includes(recSearch.toLowerCase())
  )

  const filteredPagar = contasPagar.filter(c =>
    c.descricao.toLowerCase().includes(pagSearch.toLowerCase()) ||
    c.categoria.toLowerCase().includes(pagSearch.toLowerCase()) ||
    c.fornecedor.toLowerCase().includes(pagSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { key: 'visao-geral', label: t('fin_visao_geral') },
          { key: 'fluxo', label: t('fin_fluxo_caixa') },
          { key: 'contas-receber', label: t('fin_contas_receber') },
          { key: 'contas-pagar', label: t('fin_contas_pagar') },
          { key: 'conciliacao', label: t('fin_conciliacao') },
          { key: 'guias', label: t('fin_guias') },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ============ VISAO GERAL ============ */}
      {tab === 'visao-geral' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><TrendingUp size={20} className="text-success" /></div>
                <div><p className="text-sm text-text-secondary">{t('fin_receitas')}</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {receitas.toFixed(2)}</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-danger-pale flex items-center justify-center"><TrendingDown size={20} className="text-danger" /></div>
                <div><p className="text-sm text-text-secondary">{t('fin_despesas')}</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {despesas.toFixed(2)}</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><DollarSign size={20} className="text-blue-brand" /></div>
                <div><p className="text-sm text-text-secondary">{t('fin_saldo')}</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {saldo.toFixed(2)}</p></div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_receber_pendente')}</p>
              <p className="text-xl font-semibold text-success mt-1">R$ {pendenteReceber.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_pagar_pendente')}</p>
              <p className="text-xl font-semibold text-danger mt-1">R$ {pendentePagar.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_saldo_projetado')}</p>
              <p className={`text-xl font-semibold mt-1 ${saldoProjetado >= 0 ? 'text-success' : 'text-danger'}`}>
                R$ {saldoProjetado.toFixed(2)}
              </p>
            </Card>
          </div>

          {/* 90-day critical delay alert */}
          {atrasoCritico.length > 0 && (
            <div className="bg-danger-pale border border-danger/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger">{t('fin_atraso_critico')}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {atrasoCritico.map(c => `${c.paciente} (${c.convenio || 'particular'}) - R$ ${c.valor.toFixed(2)} - ${c.diasAtraso} dias`).join(' | ')}
                </p>
                <p className="text-xs text-text-muted mt-1">{t('fin_90_days_warning')}</p>
              </div>
            </div>
          )}

          <Card header={<span className="font-heading text-base font-medium">{t('fin_ultimos_lancamentos')}</span>}>
            <Table headers={[t('data'), t('descricao'), t('categoria'), t('tipo'), t('valor'), t('status')]}>
              {contasReceber.length === 0 && contasPagar.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">{t('no_data')}</td></tr>
              ) : (
                [...contasReceber.slice(0, 3).map(c => ({ data: c.vencimento, descricao: c.paciente + ' - ' + c.procedimento, categoria: c.tipo === 'convenio' ? c.convenio || 'Convênio' : 'Particular', tipo: 'receita' as const, valor: c.valor, status: c.status })),
                 ...contasPagar.slice(0, 3).map(c => ({ data: c.vencimento, descricao: c.descricao, categoria: c.categoria, tipo: 'despesa' as const, valor: c.valor, status: c.status }))]
                  .slice(0, 5).map((item, i) => (
                  <tr key={i} className="hover:bg-blue-pale transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">{item.data}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{item.descricao}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{item.categoria}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.tipo === 'receita' ? 'green' : 'red'}>{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {item.valor.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[item.status] || 'amber'}>{item.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        </>
      )}

      {/* ============ FLUXO DE CAIXA ============ */}
      {tab === 'fluxo' && (
        <div className="space-y-4">
          <Card header={<span className="font-heading text-base font-medium">{t('fin_fluxo_caixa')}</span>}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-bg-card-alt">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{t('descricao')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{t('categoria')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('valor')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{t('vencimento')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{t('situacao')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contasReceber.filter(c => c.status !== 'recebido').map(c => (
                    <tr key={c.id} className="hover:bg-blue-pale transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{c.paciente}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{c.procedimento}</td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${c.diasAtraso >= 90 ? 'text-danger' : 'text-success'}`}>
                        + R$ {c.valor.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{c.vencimento}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.diasAtraso >= 90 ? 'red' : c.status === 'pendente' ? 'amber' : 'blue'}>
                          {c.status} {c.diasAtraso > 0 ? `(${c.diasAtraso}d)` : ''}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {contasPagar.filter(c => c.status !== 'pago').map(c => (
                    <tr key={c.id} className="hover:bg-blue-pale transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{c.descricao}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{c.categoria}</td>
                      <td className="px-4 py-3 text-sm font-medium text-danger text-right">- R$ {c.valor.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{c.vencimento}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === 'atrasado' ? 'red' : c.status === 'pendente' ? 'amber' : 'blue'}>
                          {c.status} {c.diasAtraso > 0 ? `(${c.diasAtraso}d)` : ''}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="bg-blue-pale rounded-xl p-4 flex items-start gap-3">
            <Clock size={18} className="text-blue-brand flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-mid">{t('fin_90_days_warning')}</p>
          </div>
        </div>
      )}

      {/* ============ CONTAS A RECEBER ============ */}
      {tab === 'contas-receber' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={recSearch} onChange={e => setRecSearch(e.target.value)}
                placeholder={t('search')} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <Button onClick={() => { setEditId(null); setRecForm({ paciente: '', valor: '', procedimento: '', tipo: 'particular', convenio: '', emissao: '', vencimento: '' }); setShowReceberModal(true) }}>
              <Plus size={16} /> {t('fin_nova_conta_receber')}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card><p className="text-sm text-text-secondary">{t('total')}</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {contasReceber.reduce((a, b) => a + b.valor, 0).toFixed(2)}</p></Card>
            <Card><p className="text-sm text-text-secondary">{t('fin_receber_pendente')}</p><p className="text-xl font-semibold text-success mt-1">R$ {pendenteReceber.toFixed(2)}</p></Card>
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_atraso_critico')}</p>
              <p className="text-xl font-semibold text-danger mt-1">{atrasoCritico.length}</p>
            </Card>
          </div>

          <Card>
            <Table headers={[t('fin_paciente'), t('fin_procedimento'), t('tipo'), t('fin_convenio'), t('fin_valor'), t('fin_emissao'), t('fin_vencimento'), t('situacao'), t('actions')]}>
              {filteredReceber.map(c => (
                <tr key={c.id} className={`hover:bg-blue-pale transition-colors ${c.diasAtraso >= 90 ? 'bg-danger-pale/30' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.paciente}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.procedimento}</td>
                  <td className="px-4 py-3"><Badge variant={c.tipo === 'particular' ? 'green' : 'blue'}>{c.tipo}</Badge></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.convenio || '-'}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${c.diasAtraso >= 90 ? 'text-danger' : 'text-text-primary'}`}>R$ {c.valor.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.emissao}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.vencimento}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.diasAtraso >= 90 ? 'red' : statusVariant[c.status] || 'amber'}>
                      {c.status}{c.diasAtraso > 0 ? ` ${c.diasAtraso}d` : ''}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleReceberStatus(c.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={c.status === 'recebido' ? 'Reabrir' : 'Marcar recebido'}>
                        {c.status === 'recebido' ? <XCircle size={14} className="text-text-muted" /> : <CheckCircle size={14} className="text-success" />}
                      </button>
                      <button onClick={() => handleEditReceber(c)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={t('edit')}>
                        <FileText size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => handleDeleteReceber(c.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={t('excluir')}>
                        <XCircle size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* ============ CONTAS A PAGAR ============ */}
      {tab === 'contas-pagar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={pagSearch} onChange={e => setPagSearch(e.target.value)}
                placeholder={t('search')} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <Button onClick={() => { setEditId(null); setPagForm({ descricao: '', valor: '', categoria: '', vencimento: '', fornecedor: '' }); setShowPagarModal(true) }}>
              <Plus size={16} /> {t('fin_nova_conta_pagar')}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card><p className="text-sm text-text-secondary">{t('total')}</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {contasPagar.reduce((a, b) => a + b.valor, 0).toFixed(2)}</p></Card>
            <Card><p className="text-sm text-text-secondary">{t('fin_pagar_pendente')}</p><p className="text-xl font-semibold text-danger mt-1">R$ {pendentePagar.toFixed(2)}</p></Card>
            <Card><p className="text-sm text-text-secondary">{t('status_atrasado')}</p><p className="text-xl font-semibold text-danger mt-1">{contasPagar.filter(c => c.status === 'atrasado').length}</p></Card>
          </div>

          <Card>
            <Table headers={[t('fin_descricao'), t('fin_categoria'), t('fin_fornecedor'), t('fin_valor'), t('fin_vencimento'), t('situacao'), t('actions')]}>
              {filteredPagar.map(c => (
                <tr key={c.id} className={`hover:bg-blue-pale transition-colors ${c.status === 'atrasado' ? 'bg-danger-pale/30' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.descricao}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.categoria}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.fornecedor}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {c.valor.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.vencimento}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === 'atrasado' ? 'red' : statusVariant[c.status] || 'amber'}>
                      {c.status}{c.diasAtraso > 0 ? ` ${c.diasAtraso}d` : ''}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleTogglePagarStatus(c.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={c.status === 'pago' ? 'Reabrir' : 'Pagar'}>
                        {c.status === 'pago' ? <XCircle size={14} className="text-text-muted" /> : <CheckCircle size={14} className="text-success" />}
                      </button>
                      <button onClick={() => handleEditPagar(c)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={t('edit')}>
                        <FileText size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => handleDeletePagar(c.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title={t('excluir')}>
                        <XCircle size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* ============ CONCILIACAO ============ */}
      {tab === 'conciliacao' && (
        <div className="space-y-4">
          <div className="bg-success-pale border border-success/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium text-text-primary">{t('fin_auto_reconcile')}</p>
                <p className="text-xs text-text-secondary">{t('fin_auto_reconcile_desc')}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <RefreshCw size={14} /> {t('fin_reconcile_now')}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-text-secondary">{t('total')}</p>
              <p className="text-xl font-semibold text-text-primary mt-1">{extrato.length} lançamentos</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_matched')}</p>
              <p className="text-xl font-semibold text-success mt-1">{extrato.filter(e => e.status === 'conciliado').length}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">{t('fin_unmatched')}</p>
              <p className="text-xl font-semibold text-danger mt-1">{extrato.filter(e => e.status !== 'conciliado').length}</p>
            </Card>
          </div>

          <Card header={<span className="font-heading text-base font-medium">{t('fin_statement')}</span>}>
            <Table headers={[t('data'), t('descricao'), t('categoria'), t('valor'), t('situacao')]}>
              {extrato.map(e => {
                const match = contasReceber.find(cr => Math.abs(cr.valor - e.valor) < 0.01 && cr.status !== 'recebido')
                return (
                  <tr key={e.id} className={`hover:bg-blue-pale transition-colors ${e.status === 'conciliado' ? 'bg-success-pale/20' : ''}`}>
                    <td className="px-4 py-3 text-sm text-text-primary">{e.data}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{e.descricao}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{e.categoria}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {e.valor.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.status === 'conciliado' ? 'green' : match ? 'gold' : 'red'}>
                        {e.status === 'conciliado' ? t('fin_matched') : match ? `${t('fin_unmatched')} (match: ${match.paciente})` : t('fin_unmatched')}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </Table>
          </Card>

          <div className="flex justify-center">
            <Button variant="secondary">
              <Banknote size={16} /> {t('fin_import_of')}
            </Button>
          </div>
        </div>
      )}

      {/* ============ GUIAS E IMPOSTOS ============ */}
      {tab === 'guias' && (
        <div className="space-y-4">
          <Card header={<span className="font-heading text-base font-medium">{t('fin_guias')}</span>}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <PiggyBank size={18} className="text-blue-brand" />
                    <h3 className="text-sm font-medium text-text-primary">Imposto de Renda (IRPF)</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Próximo vencimento: <strong className="text-text-primary">31/05/2026</strong></p>
                  <p className="text-xs text-text-secondary mt-1">Alíquota estimada: <strong className="text-text-primary">27,5%</strong></p>
                  <p className="text-xs text-text-muted mt-2">Regime: Lucro Presumido · Base de cálculo mensal</p>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-warning" />
                    <h3 className="text-sm font-medium text-text-primary">ISS</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Próximo vencimento: <strong className="text-text-primary">15/05/2026</strong></p>
                  <p className="text-xs text-text-secondary mt-1">Alíquota: <strong className="text-text-primary">2% a 5%</strong></p>
                  <p className="text-xs text-text-muted mt-2">Municipal · Serviços médicos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-success" />
                    <h3 className="text-sm font-medium text-text-primary">PIS / COFINS</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Próximo vencimento: <strong className="text-text-primary">25/05/2026</strong></p>
                  <p className="text-xs text-text-secondary mt-1">Alíquotas: <strong className="text-text-primary">0,65% + 3%</strong></p>
                  <p className="text-xs text-text-muted mt-2">Regime cumulativo · Lucro Presumido</p>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-danger" />
                    <h3 className="text-sm font-medium text-text-primary">CSLL</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Próximo vencimento: <strong className="text-text-primary">31/05/2026</strong></p>
                  <p className="text-xs text-text-secondary mt-1">Alíquota: <strong className="text-text-primary">9%</strong></p>
                  <p className="text-xs text-text-muted mt-2">Sobre o lucro presumido</p>
                </div>
              </div>
            </div>
          </Card>

          <Card header={<span className="font-heading text-base font-medium">Obrigações Acessórias</span>}>
            <div className="space-y-3">
              {[
                { nome: 'Declaração de Imposto de Renda PF', prazo: '31/05/2026', status: 'pendente' },
                { nome: 'DMED (Declaração de Serviços Médicos)', prazo: '28/02/2027', status: 'pendente' },
                { nome: 'ECF (Escrituração Contábil Fiscal)', prazo: '31/07/2026', status: 'pendente' },
                { nome: 'EFD-Reinf', prazo: '15/05/2026', status: 'pendente' },
                { nome: 'Declaração de ISS', prazo: '15/05/2026', status: 'pendente' },
              ].map((o, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg-card-alt">
                  <div>
                    <p className="text-sm text-text-primary">{o.nome}</p>
                    <p className="text-xs text-text-muted">Vencimento: {o.prazo}</p>
                  </div>
                  <Badge variant={o.status === 'pendente' ? 'amber' : 'green'}>{o.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ============ MODAL CONTAS A RECEBER ============ */}
      <Modal open={showReceberModal} onClose={() => setShowReceberModal(false)}
        title={editId ? t('edit') + ' ' + t('fin_contas_receber') : t('fin_nova_conta_receber')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_paciente')}</label>
            <input value={recForm.paciente} onChange={e => setRecForm(p => ({ ...p, paciente: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_valor')}</label>
              <input type="number" step="0.01" value={recForm.valor} onChange={e => setRecForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_procedimento')}</label>
              <input value={recForm.procedimento} onChange={e => setRecForm(p => ({ ...p, procedimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('tipo')}</label>
              <select value={recForm.tipo} onChange={e => setRecForm(p => ({ ...p, tipo: e.target.value as 'particular' | 'convenio' }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="particular">Particular</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>
            {recForm.tipo === 'convenio' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_convenio')}</label>
                <select value={recForm.convenio} onChange={e => setRecForm(p => ({ ...p, convenio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="">Selecionar</option>
                  <option value="UNIMED">UNIMED</option>
                  <option value="SulAmérica">SulAmérica</option>
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="Amil">Amil</option>
                  <option value="NotreDame">NotreDame</option>
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_emissao')}</label>
              <input type="date" value={recForm.emissao} onChange={e => setRecForm(p => ({ ...p, emissao: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_vencimento')}</label>
              <input type="date" value={recForm.vencimento} onChange={e => setRecForm(p => ({ ...p, vencimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowReceberModal(false)}>{t('cancelar')}</Button>
            <Button className="flex-1" onClick={handleAddReceber}>{t('salvar')}</Button>
          </div>
        </div>
      </Modal>

      {/* ============ MODAL CONTAS A PAGAR ============ */}
      <Modal open={showPagarModal} onClose={() => setShowPagarModal(false)}
        title={editId ? t('edit') + ' ' + t('fin_contas_pagar') : t('fin_nova_conta_pagar')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_descricao')}</label>
            <input value={pagForm.descricao} onChange={e => setPagForm(p => ({ ...p, descricao: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_valor')}</label>
              <input type="number" step="0.01" value={pagForm.valor} onChange={e => setPagForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_categoria')}</label>
              <select value={pagForm.categoria} onChange={e => setPagForm(p => ({ ...p, categoria: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="">Selecionar</option>
                <option value="Despesas Fixas">Despesas Fixas</option>
                <option value="Insumos">Insumos</option>
                <option value="Folha">Folha</option>
                <option value="Serviços">Serviços</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Impostos">Impostos</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_vencimento')}</label>
              <input type="date" value={pagForm.vencimento} onChange={e => setPagForm(p => ({ ...p, vencimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{t('fin_fornecedor')}</label>
              <input value={pagForm.fornecedor} onChange={e => setPagForm(p => ({ ...p, fornecedor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPagarModal(false)}>{t('cancelar')}</Button>
            <Button className="flex-1" onClick={handleAddPagar}>{t('salvar')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
