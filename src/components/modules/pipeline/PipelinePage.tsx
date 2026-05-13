import { useState } from 'react'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { PipelineCard } from '../../../types'
import { DollarSign, Phone, MessageCircle, Handshake, CheckCircle, Plus, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'

const stageConfig: Record<string, { title: string; icon: typeof DollarSign; color: string }> = {
  'nao-contatado': { title: 'Não contatado', icon: Phone, color: 'text-text-muted' },
  'contatado': { title: 'Contatado', icon: MessageCircle, color: 'text-blue-brand' },
  'negociacao': { title: 'Negociação', icon: Handshake, color: 'text-warning' },
  'acordo': { title: 'Acordo', icon: DollarSign, color: 'text-gold' },
  'recuperado': { title: 'Recuperado', icon: CheckCircle, color: 'text-success' },
}

const stages = ['nao-contatado', 'contatado', 'negociacao', 'acordo', 'recuperado']

const nextStage: Record<string, string> = {
  'nao-contatado': 'contatado',
  'contatado': 'negociacao',
  'negociacao': 'acordo',
  'acordo': 'recuperado',
  'recuperado': '',
}

export function PipelinePage() {
  const [cards, setCards] = usePersistedState<PipelineCard[]>('medvante-pipeline', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ paciente: '', valor: '', procedimento: '', contato: '', observacao: '', etapa: 'nao-contatado' as string })

  const handleMoveCard = (id: string, direction: 'forward' | 'backward') => {
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c
      const idx = stages.indexOf(c.etapa)
      if (direction === 'forward' && idx < stages.length - 1) return { ...c, etapa: stages[idx + 1] as PipelineCard['etapa'] }
      if (direction === 'backward' && idx > 0) return { ...c, etapa: stages[idx - 1] as PipelineCard['etapa'] }
      return c
    }))
  }

  const handleSave = () => {
    const nova: PipelineCard = {
      id: editId || 'pc' + Date.now(),
      paciente: form.paciente,
      valor: parseFloat(form.valor) || 0,
      diasAtraso: 0,
      procedimento: form.procedimento,
      contato: form.contato || undefined,
      observacao: form.observacao || undefined,
      etapa: form.etapa as PipelineCard['etapa'],
    }
    if (editId) {
      setCards(prev => prev.map(c => c.id === editId ? { ...c, ...nova } : c))
    } else {
      setCards(prev => [...prev, nova])
    }
    setShowModal(false); setEditId(null)
    setForm({ paciente: '', valor: '', procedimento: '', contato: '', observacao: '', etapa: 'nao-contatado' })
  }

  const handleEdit = (c: PipelineCard) => {
    setForm({ paciente: c.paciente, valor: String(c.valor), procedimento: c.procedimento, contato: c.contato || '', observacao: c.observacao || '', etapa: c.etapa })
    setEditId(c.id); setShowModal(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-text-secondary">{cards.length} cards ativos</p>
        <Button onClick={() => { setEditId(null); setForm({ paciente: '', valor: '', procedimento: '', contato: '', observacao: '', etapa: 'nao-contatado' }); setShowModal(true) }}>
          <Plus size={16} /> Novo card
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)] overflow-auto">
        {stages.map((stage) => {
          const config = stageConfig[stage]
          const stageCards = cards.filter((c) => c.etapa === stage)
          const totalValue = stageCards.reduce((a, b) => a + b.valor, 0)
          const Icon = config.icon

          return (
            <div key={stage} className="bg-bg-app rounded-xl border border-border flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={config.color} />
                  <h3 className="text-sm font-medium text-text-primary">{config.title}</h3>
                  <Badge variant="blue">{stageCards.length}</Badge>
                </div>
                <p className="text-xs font-semibold text-text-primary">R$ {totalValue.toFixed(2)}</p>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {stageCards.map((card) => (
                  <div key={card.id} className="bg-bg-card rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{card.paciente}</p>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">{card.procedimento}</p>
                      </div>
                      <button onClick={() => handleEdit(card)} className="text-text-muted hover:text-text-primary cursor-pointer p-1">
                        <XCircle size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-text-primary">R$ {card.valor.toFixed(2)}</span>
                      <Badge variant={card.diasAtraso > 30 ? 'red' : card.diasAtraso > 15 ? 'amber' : 'blue'}>
                        {card.diasAtraso}d
                      </Badge>
                    </div>
                    {card.contato && <p className="text-[10px] text-text-muted mt-1 truncate">{card.contato}</p>}
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => handleMoveCard(card.id, 'backward')} disabled={stage === 'nao-contatado'}
                        className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] text-text-muted flex-1 text-center">
                        {stage === 'recuperado' ? 'Concluído' : `→ ${stageConfig[nextStage[stage]]?.title || ''}`}
                      </span>
                      <button onClick={() => handleMoveCard(card.id, 'forward')} disabled={stage === 'recuperado'}
                        className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar card' : 'Novo card'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente</label>
              <input value={form.paciente} onChange={e => setForm(p => ({ ...p, paciente: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Procedimento</label>
            <input value={form.procedimento} onChange={e => setForm(p => ({ ...p, procedimento: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Contato</label>
              <input value={form.contato} onChange={e => setForm(p => ({ ...p, contato: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Etapa</label>
              <select value={form.etapa} onChange={e => setForm(p => ({ ...p, etapa: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                {stages.map(s => <option key={s} value={s}>{stageConfig[s].title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Observação</label>
            <textarea value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
