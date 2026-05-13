import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { Glosa } from '../../../types'
import { Plus, AlertTriangle } from 'lucide-react'

export function GlosasPage() {
  const [glosas, setGlosas] = usePersistedState<Glosa[]>('medvante-glosas', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ paciente: '', convenio: '', procedimento: '', valorOriginal: '', valorGlosado: '', motivo: '', data: '', prazoRecurso: '' })

  const totalGlosado = glosas.reduce((a, b) => a + b.valorGlosado, 0)
  const totalOriginal = glosas.reduce((a, b) => a + b.valorOriginal, 0)

  const statusVariant: Record<string, 'amber' | 'blue' | 'green' | 'red'> = {
    aberta: 'amber', contestada: 'blue', reembolsada: 'green', perdida: 'red',
  }

  const handleSave = () => {
    const nova: Glosa = {
      id: editId || 'g' + Date.now(),
      paciente: form.paciente,
      convenio: form.convenio,
      procedimento: form.procedimento,
      valorOriginal: parseFloat(form.valorOriginal) || 0,
      valorGlosado: parseFloat(form.valorGlosado) || 0,
      motivo: form.motivo,
      data: form.data,
      status: 'aberta',
      prazoRecurso: form.prazoRecurso || undefined,
    }
    if (editId) {
      setGlosas(prev => prev.map(g => g.id === editId ? { ...g, ...nova } : g))
    } else {
      setGlosas(prev => [...prev, nova])
    }
    setShowModal(false); setEditId(null)
    setForm({ paciente: '', convenio: '', procedimento: '', valorOriginal: '', valorGlosado: '', motivo: '', data: '', prazoRecurso: '' })
  }

  const handleEdit = (g: Glosa) => {
    setForm({ paciente: g.paciente, convenio: g.convenio, procedimento: g.procedimento, valorOriginal: String(g.valorOriginal), valorGlosado: String(g.valorGlosado), motivo: g.motivo, data: g.data, prazoRecurso: g.prazoRecurso || '' })
    setEditId(g.id); setShowModal(true)
  }

  const handleDelete = (id: string) => setGlosas(prev => prev.filter(g => g.id !== id))

  const handleToggleStatus = (id: string) => {
    const statusOrder = ['aberta', 'contestada', 'reembolsada', 'perdida']
    setGlosas(prev => prev.map(g => {
      if (g.id !== id) return g
      const idx = statusOrder.indexOf(g.status)
      return { ...g, status: statusOrder[Math.min(idx + 1, statusOrder.length - 1)] as Glosa['status'] }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <Card>
            <p className="text-sm text-text-secondary">Total glosado</p>
            <p className="text-xl font-semibold text-danger mt-1">R$ {totalGlosado.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Taxa de glosa</p>
            <p className="text-xl font-semibold text-text-primary mt-1">{totalOriginal > 0 ? ((totalGlosado / totalOriginal) * 100).toFixed(1) : '0'}%</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Glosas abertas</p>
            <p className="text-xl font-semibold text-warning mt-1">{glosas.filter(g => g.status === 'aberta').length}</p>
          </Card>
        </div>
        <div className="ml-4">
          <Button onClick={() => { setEditId(null); setForm({ paciente: '', convenio: '', procedimento: '', valorOriginal: '', valorGlosado: '', motivo: '', data: '', prazoRecurso: '' }); setShowModal(true) }}>
            <Plus size={16} /> Nova glosa
          </Button>
        </div>
      </div>

      {glosas.filter(g => g.status === 'aberta' && g.prazoRecurso).length > 0 && (
        <div className="bg-danger-pale border border-danger/20 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-danger flex-shrink-0" />
          <p className="text-xs text-text-secondary">
            {glosas.filter(g => g.status === 'aberta' && g.prazoRecurso).length} glosa(s) com prazo de recurso ativo — conteste dentro do prazo para não perder o valor.
          </p>
        </div>
      )}

      <Card header={<span className="font-heading text-base font-medium">Glosas</span>}>
        <Table headers={['Paciente', 'Convênio', 'Procedimento', 'Valor Original', 'Valor Glosado', 'Motivo', 'Status', 'Prazo', 'Ações']}>
          {glosas.map((g) => (
            <tr key={g.id} className="hover:bg-blue-pale transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-text-primary">{g.paciente}</td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.convenio}</td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.procedimento}</td>
              <td className="px-4 py-3 text-sm text-text-primary">R$ {g.valorOriginal.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-medium text-danger">R$ {g.valorGlosado.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-text-secondary max-w-[200px] truncate">{g.motivo}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleToggleStatus(g.id)} className="cursor-pointer">
                  <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.prazoRecurso || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(g)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer text-xs text-blue-brand">Editar</button>
                  <button onClick={() => handleDelete(g.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer text-xs text-danger">Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar glosa' : 'Nova glosa'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente</label>
              <input value={form.paciente} onChange={e => setForm(p => ({ ...p, paciente: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Convênio</label>
              <input value={form.convenio} onChange={e => setForm(p => ({ ...p, convenio: e.target.value }))}
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
              <label className="block text-sm font-medium text-text-primary mb-1">Valor Original (R$)</label>
              <input type="number" step="0.01" value={form.valorOriginal} onChange={e => setForm(p => ({ ...p, valorOriginal: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor Glosado (R$)</label>
              <input type="number" step="0.01" value={form.valorGlosado} onChange={e => setForm(p => ({ ...p, valorGlosado: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Motivo</label>
            <textarea value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Data</label>
              <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Prazo recurso</label>
              <input type="date" value={form.prazoRecurso} onChange={e => setForm(p => ({ ...p, prazoRecurso: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
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
