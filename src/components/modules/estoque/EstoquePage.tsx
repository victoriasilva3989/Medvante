import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { StockItem } from '../../../types'
import { Plus, AlertTriangle, Search, Pencil, Trash2, Package } from 'lucide-react'

export function EstoquePage() {
  const [items, setItems] = usePersistedState<StockItem[]>('medvante-estoque', [])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', categoria: '', quantidade: '', quantidadeMinima: '', unidade: '', valorUnitario: '', validade: '', fornecedor: '' })

  const filtered = items.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.categoria.toLowerCase().includes(search.toLowerCase()) ||
    (i.fornecedor || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = items.reduce((a, b) => a + b.quantidade * b.valorUnitario, 0)
  const belowMin = items.filter(i => i.quantidade < i.quantidadeMinima)

  const resetForm = () => setForm({ nome: '', categoria: '', quantidade: '', quantidadeMinima: '', unidade: '', valorUnitario: '', validade: '', fornecedor: '' })

  const handleEdit = (item: StockItem) => {
    setForm({
      nome: item.nome, categoria: item.categoria, quantidade: String(item.quantidade),
      quantidadeMinima: String(item.quantidadeMinima), unidade: item.unidade,
      valorUnitario: String(item.valorUnitario), validade: item.validade || '', fornecedor: item.fornecedor || '',
    })
    setEditId(item.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nome || !form.quantidade) return
    const item: StockItem = {
      id: editId || 'est-' + Date.now(),
      nome: form.nome,
      categoria: form.categoria,
      quantidade: parseInt(form.quantidade) || 0,
      quantidadeMinima: parseInt(form.quantidadeMinima) || 0,
      unidade: form.unidade || 'un',
      valorUnitario: parseFloat(form.valorUnitario) || 0,
      validade: form.validade || undefined,
      fornecedor: form.fornecedor || undefined,
    }
    if (editId) {
      setItems(prev => prev.map(i => i.id === editId ? item : i))
    } else {
      setItems(prev => [...prev, item])
    }
    setShowModal(false)
    setEditId(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este item do estoque?')) setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <PaywallGate feature="pro" description="Gerencie seu estoque com controle de validade, fornecedores e alertas de reposição automática.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar item..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button variant="primary" onClick={() => { setEditId(null); resetForm(); setShowModal(true) }}>
            <Plus size={16} /> Novo item
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Package size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Itens em estoque</p><p className="text-xl font-semibold text-text-primary mt-1">{items.length}</p></div>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Valor total</p>
            <p className="text-xl font-semibold text-text-primary mt-1">R$ {totalValue.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Itens abaixo do mínimo</p>
            <p className="text-xl font-semibold text-danger mt-1">{belowMin.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Valor médio por item</p>
            <p className="text-xl font-semibold text-text-primary mt-1">
              {items.length > 0 ? `R$ ${(totalValue / items.length).toFixed(2)}` : 'R$ 0,00'}
            </p>
          </Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Estoque</span>}>
          <Table headers={['Item', 'Categoria', 'Qtd', 'Mínimo', 'Unidade', 'Valor unit.', 'Validade', 'Fornecedor', 'Status', 'Ações']}>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum item encontrado</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.nome}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    <Badge variant="blue">{item.categoria || 'Geral'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{item.quantidade}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.quantidadeMinima}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.unidade}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">R$ {item.valorUnitario.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.validade || '-'}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.fornecedor || '-'}</td>
                  <td className="px-4 py-3">
                    {item.quantidade < item.quantidadeMinima ? (
                      <Badge variant="red"><AlertTriangle size={12} /> Repor</Badge>
                    ) : (
                      <Badge variant="green">OK</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Editar">
                        <Pencil size={14} className="text-text-muted" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Excluir">
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
          title={editId ? 'Editar item' : 'Novo item'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
                <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Categoria</label>
                <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="">Selecionar</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Higiene">Higiene</option>
                  <option value="Curativos">Curativos</option>
                  <option value="Equipamentos">Equipamentos</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Quantidade *</label>
                <input type="number" min="0" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Qtd. mínima</label>
                <input type="number" min="0" value={form.quantidadeMinima} onChange={e => setForm(p => ({ ...p, quantidadeMinima: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Unidade</label>
                <select value={form.unidade} onChange={e => setForm(p => ({ ...p, unidade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                  <option value="un">Unidade</option>
                  <option value="cx">Caixa</option>
                  <option value="pct">Pacote</option>
                  <option value="L">Litro</option>
                  <option value="kg">Quilo</option>
                  <option value="ml">Ml</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Valor unitário (R$)</label>
                <input type="number" step="0.01" min="0" value={form.valorUnitario} onChange={e => setForm(p => ({ ...p, valorUnitario: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Validade</label>
                <input type="date" value={form.validade} onChange={e => setForm(p => ({ ...p, validade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Fornecedor</label>
              <input value={form.fornecedor} onChange={e => setForm(p => ({ ...p, fornecedor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditId(null); resetForm() }}>Cancelar</Button>
              <Button className="flex-1" disabled={!form.nome || !form.quantidade} onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PaywallGate>
  )
}