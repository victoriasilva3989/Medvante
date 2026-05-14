import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { Campaign, NPSEvaluation } from '../../../types'
import { Megaphone, Star, Send, Search, Pencil, Trash2, MessageSquare, Mail, Phone } from 'lucide-react'

const tipoIcon: Record<string, typeof Send> = { whatsapp: MessageSquare, email: Mail, sms: Phone }

export function MarketingPage() {
  const [campanhas, setCampanhas] = usePersistedState<Campaign[]>('medvante-campanhas', [])
  const [npsList, setNpsList] = usePersistedState<NPSEvaluation[]>('medvante-nps', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showNpsModal, setShowNpsModal] = useState(false)
  const [npsForm, setNpsForm] = useState({ paciente: '', nota: '10', comentario: '' })
  const [form, setForm] = useState({ nome: '', tipo: 'whatsapp' as Campaign['tipo'], disparos: '', abertos: '', respondidos: '', data: '', status: 'rascunho' as Campaign['status'] })

  const resetForm = () => setForm({ nome: '', tipo: 'whatsapp', disparos: '', abertos: '', respondidos: '', data: new Date().toISOString().split('T')[0], status: 'rascunho' })

  const filtered = campanhas.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  )

  const totalEnviadas = campanhas.filter(c => c.status === 'enviada' || c.status === 'concluida').length
  const npsMedia = npsList.length > 0 ? npsList.reduce((a, b) => a + b.nota, 0) / npsList.length : 0
  const totalConversao = campanhas.reduce((a, b) => a + b.taxaConversao, 0)
  const mediaConversao = campanhas.length > 0 ? totalConversao / campanhas.length : 0

  const handleEdit = (c: Campaign) => {
    setForm({ nome: c.nome, tipo: c.tipo, disparos: String(c.disparos), abertos: String(c.abertos), respondidos: String(c.respondidos), data: c.data, status: c.status })
    setEditId(c.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nome) return
    const disparos = parseInt(form.disparos) || 0
    const abertos = parseInt(form.abertos) || 0
    const respondidos = parseInt(form.respondidos) || 0
    const taxa = disparos > 0 ? (respondidos / disparos) * 100 : 0
    const campaign: Campaign = {
      id: editId || 'cmp-' + Date.now(),
      nome: form.nome,
      tipo: form.tipo,
      disparos, abertos, respondidos,
      taxaConversao: parseFloat(taxa.toFixed(1)),
      data: form.data || new Date().toISOString().split('T')[0],
      status: form.status,
    }
    if (editId) {
      setCampanhas(prev => prev.map(c => c.id === editId ? campaign : c))
    } else {
      setCampanhas(prev => [...prev, campaign])
    }
    setShowModal(false)
    setEditId(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta campanha?')) setCampanhas(prev => prev.filter(c => c.id !== id))
  }

  const handleAddNps = () => {
    if (!npsForm.paciente || !npsForm.nota) return
    const nps: NPSEvaluation = {
      id: 'nps-' + Date.now(),
      paciente: npsForm.paciente,
      nota: parseInt(npsForm.nota) || 10,
      comentario: npsForm.comentario || undefined,
      data: new Date().toISOString().split('T')[0],
      atendimentoId: '',
    }
    setNpsList(prev => [...prev, nps])
    setNpsForm({ paciente: '', nota: '10', comentario: '' })
    setShowNpsModal(false)
  }

  return (
    <PaywallGate feature="pro" description="Dispare campanhas de marketing, colete NPS dos pacientes e aumente suas taxas de retorno.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar campanha..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowNpsModal(true)}><Star size={16} /> Novo NPS</Button>
            <Button variant="primary" onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}><Send size={16} /> Nova campanha</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Megaphone size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Campanhas enviadas</p><p className="text-xl font-semibold text-text-primary mt-1">{totalEnviadas}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><Star size={20} className="text-success" /></div>
              <div><p className="text-sm text-text-secondary">NPS médio</p><p className="text-xl font-semibold text-text-primary mt-1">{npsMedia > 0 ? npsMedia.toFixed(0) : '-'}</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-pale flex items-center justify-center"><Send size={20} className="text-gold" /></div>
              <div><p className="text-sm text-text-secondary">Taxa de conversão</p><p className="text-xl font-semibold text-text-primary mt-1">{mediaConversao.toFixed(1)}%</p></div>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Avaliações NPS</p>
            <p className="text-xl font-semibold text-text-primary mt-1">{npsList.length}</p>
          </Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Campanhas</span>}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="bg-bg-card-alt">
                {['Nome', 'Tipo', 'Disparos', 'Abertos', 'Respondidos', 'Conversão', 'Data', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma campanha encontrada</td></tr>
                ) : (
                  filtered.map(c => {
                    const Icon = tipoIcon[c.tipo] || Send
                    return (
                      <tr key={c.id} className="hover:bg-blue-pale transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.nome}</td>
                        <td className="px-4 py-3"><Badge variant="blue"><Icon size={12} /> {c.tipo}</Badge></td>
                        <td className="px-4 py-3 text-sm text-text-primary">{c.disparos}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{c.abertos}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{c.respondidos}</td>
                        <td className="px-4 py-3 text-sm font-medium text-success">{c.taxaConversao}%</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{c.data}</td>
                        <td className="px-4 py-3">
                          <Badge variant={c.status === 'concluida' ? 'green' : c.status === 'enviada' ? 'blue' : c.status === 'agendada' ? 'amber' : 'gold'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(c)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Pencil size={14} className="text-text-muted" /></button>
                            <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer"><Trash2 size={14} className="text-danger" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* NPS List */}
        {npsList.length > 0 && (
          <Card header={<span className="font-heading text-base font-medium">Avaliações NPS</span>}>
            <div className="divide-y divide-border">
              {npsList.map(n => (
                <div key={n.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{n.paciente}</p>
                    <p className="text-xs text-text-secondary">{n.data}{n.comentario ? ` · ${n.comentario}` : ''}</p>
                  </div>
                  <div className={`text-lg font-bold ${n.nota >= 9 ? 'text-success' : n.nota >= 7 ? 'text-warning' : 'text-danger'}`}>
                    {n.nota}/10
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Campaign Modal */}
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); resetForm() }}
          title={editId ? 'Editar campanha' : 'Nova campanha'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as Campaign['tipo'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Campaign['status'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="rascunho">Rascunho</option>
                  <option value="agendada">Agendada</option>
                  <option value="enviada">Enviada</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Disparos</label>
                <input type="number" min="0" value={form.disparos} onChange={e => setForm(p => ({ ...p, disparos: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Abertos</label>
                <input type="number" min="0" value={form.abertos} onChange={e => setForm(p => ({ ...p, abertos: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Respondidos</label>
                <input type="number" min="0" value={form.respondidos} onChange={e => setForm(p => ({ ...p, respondidos: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Data</label>
              <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditId(null); resetForm() }}>Cancelar</Button>
              <Button className="flex-1" disabled={!form.nome} onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Modal>

        {/* NPS Modal */}
        <Modal open={showNpsModal} onClose={() => setShowNpsModal(false)} title="Nova avaliação NPS">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente *</label>
              <input value={npsForm.paciente} onChange={e => setNpsForm(p => ({ ...p, paciente: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nota (0-10)</label>
              <div className="flex gap-1">
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setNpsForm(p => ({ ...p, nota: String(n) }))}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all cursor-pointer ${
                      parseInt(npsForm.nota) === n
                        ? n >= 9 ? 'bg-success text-white' : n >= 7 ? 'bg-warning text-white' : 'bg-danger text-white'
                        : 'bg-bg-card-alt text-text-secondary hover:bg-border'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Comentário</label>
              <textarea value={npsForm.comentario} onChange={e => setNpsForm(p => ({ ...p, comentario: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowNpsModal(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={!npsForm.paciente} onClick={handleAddNps}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}