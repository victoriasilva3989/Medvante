import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { useCaixaStore } from '../../../store/caixaStore'
import type { CashMovement } from '../../../types'
import { Banknote, Plus, TrendingUp, TrendingDown, Search, Lock, Unlock, History } from 'lucide-react'

export function CaixaPage() {
  const { registers, openRegister, closeRegister, addMovement, getCurrentRegister, addDREEntry } = useCaixaStore()
  const [search, setSearch] = useState('')
  const [showAbrirModal, setShowAbrirModal] = useState(false)
  const [showMovimentoModal, setShowMovimentoModal] = useState(false)
  const [showFecharModal, setShowFecharModal] = useState(false)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [saldoFinal, setSaldoFinal] = useState('')
  const [movForm, setMovForm] = useState({ descricao: '', valor: '', tipo: 'entrada' as 'entrada' | 'saida', formaPagamento: 'dinheiro' as CashMovement['formaPagamento'], categoria: '', paciente: '', observacao: '' })

  const currentRegister = getCurrentRegister()

  const movimentos = registers.flatMap(r => r.movimentos)
  const filteredMov = movimentos.filter(m =>
    m.descricao.toLowerCase().includes(search.toLowerCase()) ||
    (m.paciente || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalEntradas = registers.reduce((a, r) => a + r.totalEntradas, 0)
  const totalSaidas = registers.reduce((a, r) => a + r.totalSaidas, 0)

  const handleAbrirCaixa = () => {
    const valor = parseFloat(saldoInicial) || 0
    openRegister({
      id: 'cx-' + Date.now(),
      data: new Date().toISOString().split('T')[0],
      horarioAbertura: new Date().toLocaleTimeString('pt-BR'),
      saldoInicial: valor,
      totalEntradas: 0, totalSaidas: 0,
      status: 'aberto',
      movimentos: [],
    })
    setShowAbrirModal(false)
    setSaldoInicial('')
  }

  const handleAddMovimento = () => {
    if (!movForm.descricao || !movForm.valor || !currentRegister) return
    const movimento: CashMovement = {
      id: 'mov-' + Date.now(),
      caixaId: currentRegister.id,
      data: new Date().toISOString().split('T')[0],
      horario: new Date().toLocaleTimeString('pt-BR'),
      descricao: movForm.descricao,
      valor: parseFloat(movForm.valor) || 0,
      tipo: movForm.tipo,
      formaPagamento: movForm.formaPagamento,
      categoria: movForm.categoria,
      paciente: movForm.paciente || undefined,
      observacao: movForm.observacao || undefined,
    }
    addMovement(movimento)
    addDREEntry({
      id: 'dre-' + Date.now(),
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      categoria: movForm.categoria || (movForm.tipo === 'entrada' ? 'Receita Operacional' : 'Despesa Operacional'),
      tipo: movForm.tipo === 'entrada' ? 'receita' : 'despesa',
      valor: parseFloat(movForm.valor) || 0,
      descricao: movForm.descricao,
      data: new Date().toISOString().split('T')[0],
    })
    setShowMovimentoModal(false)
    setMovForm({ descricao: '', valor: '', tipo: 'entrada', formaPagamento: 'dinheiro', categoria: '', paciente: '', observacao: '' })
  }

  const handleFecharCaixa = () => {
    if (!currentRegister) return
    closeRegister(currentRegister.id, parseFloat(saldoFinal) || (currentRegister.saldoInicial + currentRegister.totalEntradas - currentRegister.totalSaidas))
    setShowFecharModal(false)
    setSaldoFinal('')
  }

  return (
    <PaywallGate feature="pro" description="Controle de caixa diário com abertura, fechamento e movimentações financeiras.">
      <div className="space-y-6">
        {/* Status do caixa */}
        <Card className={currentRegister ? 'bg-gradient-to-r from-success-pale to-white border-success/30' : 'bg-bg-card'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentRegister ? 'bg-success text-white' : 'bg-bg-card-alt'}`}>
                <Banknote size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Caixa do dia</p>
                <p className="font-heading text-lg font-medium text-text-primary">
                  {currentRegister ? 'Caixa aberto' : 'Caixa fechado'}
                </p>
                {currentRegister && (
                  <p className="text-xs text-text-secondary">
                    Aberto às {currentRegister.horarioAbertura} · Saldo inicial: R$ {currentRegister.saldoInicial.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!currentRegister ? (
                <Button variant="primary" onClick={() => setShowAbrirModal(true)}>
                  <Unlock size={16} /> Abrir caixa
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={() => setShowMovimentoModal(true)}>
                    <Plus size={16} /> Lançar movimento
                  </Button>
                  <Button variant="danger" onClick={() => {
                    setSaldoFinal(String(currentRegister.saldoInicial + currentRegister.totalEntradas - currentRegister.totalSaidas))
                    setShowFecharModal(true)
                  }}>
                    <Lock size={16} /> Fechar caixa
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Indicadores */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><TrendingUp size={20} className="text-success" /></div>
              <div><p className="text-sm text-text-secondary">Total entradas</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {totalEntradas.toFixed(2)}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger-pale flex items-center justify-center"><TrendingDown size={20} className="text-danger" /></div>
              <div><p className="text-sm text-text-secondary">Total saídas</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {totalSaidas.toFixed(2)}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Banknote size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Saldo atual</p><p className="text-xl font-semibold text-text-primary mt-1">R$ {(totalEntradas - totalSaidas).toFixed(2)}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-pale flex items-center justify-center"><History size={20} className="text-gold" /></div>
              <div><p className="text-sm text-text-secondary">Movimentos</p><p className="text-xl font-semibold text-text-primary mt-1">{movimentos.length}</p></div>
            </div>
          </Card>
        </div>

        {/* Movimentos */}
        <Card header={
          <div className="flex items-center justify-between">
            <span className="font-heading text-base font-medium">Movimentações</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..." className="pl-8 pr-3 py-1.5 rounded-lg border border-border-strong text-xs outline-none focus:border-blue-brand w-48" />
            </div>
          </div>
        }>
          <table className="w-full border-collapse">
            <thead><tr className="bg-bg-card-alt">
              {['Data', 'Hora', 'Descrição', 'Categoria', 'Forma', 'Paciente', 'Valor', 'Tipo'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filteredMov.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum movimento registrado</td></tr>
              ) : (
                filteredMov.sort((a, b) => new Date(b.data + ' ' + b.horario).getTime() - new Date(a.data + ' ' + a.horario).getTime()).map(m => (
                  <tr key={m.id} className="hover:bg-blue-pale transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">{m.data}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{m.horario}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{m.descricao}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{m.categoria}</td>
                    <td className="px-4 py-3"><Badge variant="blue">{m.formaPagamento}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{m.paciente || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {m.valor.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={m.tipo === 'entrada' ? 'green' : 'red'}>{m.tipo === 'entrada' ? 'Entrada' : 'Saída'}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Histórico de caixas anteriores */}
        {registers.filter(r => r.status === 'fechado').length > 0 && (
          <Card header={<span className="font-heading text-base font-medium">Caixas anteriores</span>}>
            <div className="divide-y divide-border">
              {registers.filter(r => r.status === 'fechado').sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.data}</p>
                    <p className="text-xs text-text-secondary">{r.horarioAbertura} → {r.horarioFechamento} · {r.movimentos.length} movimentos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">R$ {(r.saldoFinal || 0).toFixed(2)}</p>
                    <p className={`text-xs ${(r.saldoFinal || 0) - r.saldoInicial >= 0 ? 'text-success' : 'text-danger'}`}>
                      {(r.saldoFinal || 0) - r.saldoInicial >= 0 ? '+' : ''}R$ {((r.saldoFinal || 0) - r.saldoInicial).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Abrir Caixa Modal */}
      <Modal open={showAbrirModal} onClose={() => setShowAbrirModal(false)} title="Abrir caixa">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Informe o saldo inicial para abrir o caixa do dia.</p>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Saldo inicial (R$)</label>
            <input type="number" step="0.01" min="0" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAbrirModal(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleAbrirCaixa}>Abrir caixa</Button>
          </div>
        </div>
      </Modal>

      {/* Movimento Modal */}
      <Modal open={showMovimentoModal} onClose={() => setShowMovimentoModal(false)} title="Lançar movimento">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Descrição *</label>
            <input value={movForm.descricao} onChange={e => setMovForm(p => ({ ...p, descricao: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
              <div className="flex gap-2">
                <button onClick={() => setMovForm(p => ({ ...p, tipo: 'entrada' }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${movForm.tipo === 'entrada' ? 'bg-success text-white' : 'bg-bg-card-alt text-text-secondary'}`}>
                  Entrada
                </button>
                <button onClick={() => setMovForm(p => ({ ...p, tipo: 'saida' }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${movForm.tipo === 'saida' ? 'bg-danger text-white' : 'bg-bg-card-alt text-text-secondary'}`}>
                  Saída
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor (R$) *</label>
              <input type="number" step="0.01" min="0" value={movForm.valor} onChange={e => setMovForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Forma de pagamento</label>
              <select value={movForm.formaPagamento} onChange={e => setMovForm(p => ({ ...p, formaPagamento: e.target.value as CashMovement['formaPagamento'] }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="dinheiro">Dinheiro</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Categoria</label>
              <select value={movForm.categoria} onChange={e => setMovForm(p => ({ ...p, categoria: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="">Selecionar</option>
                <option value="Receita Operacional">Receita Operacional</option>
                <option value="Despesa Fixa">Despesa Fixa</option>
                <option value="Insumos">Insumos</option>
                <option value="Folha">Folha</option>
                <option value="Serviços">Serviços</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente</label>
              <input value={movForm.paciente} onChange={e => setMovForm(p => ({ ...p, paciente: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Observação</label>
            <textarea value={movForm.observacao} onChange={e => setMovForm(p => ({ ...p, observacao: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowMovimentoModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!movForm.descricao || !movForm.valor} onClick={handleAddMovimento}>Lançar</Button>
          </div>
        </div>
      </Modal>

      {/* Fechar Caixa Modal */}
      <Modal open={showFecharModal} onClose={() => setShowFecharModal(false)} title="Fechar caixa">
        <div className="space-y-4">
          {currentRegister && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Saldo inicial</span><span className="text-text-primary">R$ {currentRegister.saldoInicial.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total entradas</span><span className="text-success">R$ {currentRegister.totalEntradas.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total saídas</span><span className="text-danger">R$ {currentRegister.totalSaidas.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-medium"><span>Saldo esperado</span><span>R$ {(currentRegister.saldoInicial + currentRegister.totalEntradas - currentRegister.totalSaidas).toFixed(2)}</span></div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Saldo final (R$)</label>
            <input type="number" step="0.01" value={saldoFinal} onChange={e => setSaldoFinal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowFecharModal(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleFecharCaixa}>Fechar caixa</Button>
          </div>
        </div>
      </Modal>
    </PaywallGate>
  )
}