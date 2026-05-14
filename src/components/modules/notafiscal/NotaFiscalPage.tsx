import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { useFaturamentoStore, type NotaFiscalServico, type NotaFiscalProduto } from '../../../store/faturamentoStore'
import {
  Plus, FileText, Package, FlaskConical, Upload,
  Shield, CheckCircle, Download, Send,
  ToggleLeft, ToggleRight, XCircle, Trash2
} from 'lucide-react'

function gerarNumero(tipo: 'servico' | 'produto', ano: number, count: number): string {
  const prefix = tipo === 'servico' ? 'NFS-e' : 'NF-e'
  return `${prefix}-${ano}-${String(count + 1).padStart(4, '0')}`
}

export function NotaFiscalPage() {
  const {
    notasServico, notasProduto,
    ambienteProducao: ambiente, setAmbienteProducao,
    addNotaServico, addNotaProduto, updateNotaStatus, removeNota
  } = useFaturamentoStore()

  const [tab, setTab] = useState('servico')
  const [showEmitir, setShowEmitir] = useState(false)
  const [emissaoTipo, setEmissaoTipo] = useState<'servico' | 'produto'>('servico')
  const [form, setForm] = useState({
    tomador: '', cpfCnpj: '', descricao: '', valor: '', quantidade: '1'
  })

  const currentList = tab === 'servico' ? notasServico : notasProduto
  const ano = new Date().getFullYear()

  const statusVariant = (status: string) => {
    switch (status) {
      case 'autorizada': return 'green' as const
      case 'pendente': return 'amber' as const
      case 'cancelada': return 'red' as const
      case 'rejeitada': return 'red' as const
      default: return 'blue' as const
    }
  }

  const handleEmitir = () => {
    const valor = parseFloat(form.valor) || 0
    if (!form.tomador || !form.descricao || valor <= 0) return

    const hoje = new Date().toISOString().split('T')[0]
    const count = tab === 'servico' ? notasServico.length : notasProduto.length

    if (emissaoTipo === 'servico') {
      const nota: NotaFiscalServico = {
        id: 'nf-serv-' + Date.now(),
        numero: gerarNumero('servico', ano, count),
        data: hoje,
        tomador: form.tomador,
        cpfCnpj: form.cpfCnpj,
        servico: form.descricao,
        valor,
        status: 'autorizada',
        ambiente: ambiente ? 'producao' : 'homologacao',
      }
      addNotaServico(nota)
    } else {
      const nota: NotaFiscalProduto = {
        id: 'nf-prod-' + Date.now(),
        numero: gerarNumero('produto', ano, count),
        data: hoje,
        tomador: form.tomador,
        cpfCnpj: form.cpfCnpj,
        produto: form.descricao,
        quantidade: parseInt(form.quantidade) || 1,
        valor,
        status: 'autorizada',
        ambiente: ambiente ? 'producao' : 'homologacao',
      }
      addNotaProduto(nota)
    }

    setShowEmitir(false)
    setForm({ tomador: '', cpfCnpj: '', descricao: '', valor: '', quantidade: '1' })
  }

  const handleCancelar = (id: string) => {
    updateNotaStatus(id, 'cancelada', tab as 'servico' | 'produto')
  }

  const handleExcluir = (id: string) => {
    removeNota(id, tab as 'servico' | 'produto')
  }

  const totalValor = currentList.reduce((a, b) => a + b.valor, 0)
  const totalAutorizadas = currentList.filter(n => n.status === 'autorizada').reduce((a, b) => a + b.valor, 0)
  const totalCanceladas = currentList.filter(n => n.status === 'cancelada').reduce((a, b) => a + b.valor, 0)

  return (
    <div className="space-y-6">
      {/* Environment Toggle + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmbienteProducao(!ambiente)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              ambiente
                ? 'bg-blue-brand text-white'
                : 'bg-warning-pale text-warning border border-warning/30'
            }`}
          >
            {ambiente ? <Shield size={16} /> : <FlaskConical size={16} />}
            {ambiente ? 'Produção' : 'Homologação'}
            {ambiente ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          {!ambiente && (
            <span className="text-xs text-warning bg-warning-pale px-3 py-1 rounded-full border border-warning/30">
              Ambiente de testes — notas sem valor fiscal
            </span>
          )}
        </div>
        <Button variant="primary" onClick={() => { setEmissaoTipo(tab as 'servico' | 'produto'); setShowEmitir(true) }}>
          <Plus size={16} /> Emitir {tab === 'servico' ? 'NFS-e' : 'NF-e'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-text-muted">Total emitido</p>
          <p className="text-lg font-semibold text-text-primary">R$ {totalValor.toFixed(2)}</p>
          <p className="text-[10px] text-text-muted">{currentList.length} nota(s)</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Autorizadas</p>
          <p className="text-lg font-semibold text-success">R$ {totalAutorizadas.toFixed(2)}</p>
          <p className="text-[10px] text-text-muted">{currentList.filter(n => n.status === 'autorizada').length} nota(s)</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Canceladas</p>
          <p className="text-lg font-semibold text-danger">R$ {totalCanceladas.toFixed(2)}</p>
          <p className="text-[10px] text-text-muted">{currentList.filter(n => n.status === 'cancelada').length} nota(s)</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Ambiente</p>
          <p className="text-lg font-semibold text-text-primary">{ambiente ? 'Produção' : 'Homologação'}</p>
          <p className="text-[10px] text-text-muted">Certificado A1 ativo</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'servico', label: 'Notas de Serviço (NFS-e)', icon: <FileText size={16} /> },
          { key: 'produto', label: 'Notas de Produto (NF-e)', icon: <Package size={16} /> },
          { key: 'certificado', label: 'Certificado Digital', icon: <Shield size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ────────── NOTAS DE SERVIÇO / PRODUTO ────────── */}
      {tab !== 'certificado' && (
        <Card header={<span className="font-heading text-base font-medium">{tab === 'servico' ? 'Notas Fiscais de Serviço (NFS-e)' : 'Notas Fiscais de Produto (NF-e)'}</span>}>
          <Table headers={['Número', 'Data', 'Tomador', tab === 'servico' ? 'Serviço' : 'Produto', tab === 'produto' ? 'Qtd' : '', 'Valor', 'Ambiente', 'Status', 'Ações']}>
            {currentList.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma nota fiscal emitida. Clique em "Emitir" para começar.</td></tr>
            ) : (
              currentList.map((nf: any) => (
                <tr key={nf.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{nf.numero}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{nf.data}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{nf.tomador}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{nf.servico || nf.produto}</td>
                  {tab === 'produto' && <td className="px-4 py-3 text-sm text-text-secondary">{nf.quantidade}</td>}
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {nf.valor.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={nf.ambiente === 'producao' ? 'blue' : 'amber'}>{nf.ambiente}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(nf.status)}>{nf.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {nf.status !== 'cancelada' && (
                        <button onClick={() => handleCancelar(nf.id)}
                          className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Cancelar">
                          <XCircle size={14} className="text-danger" />
                        </button>
                      )}
                      <button onClick={() => handleExcluir(nf.id)}
                        className="p-1 hover:bg-bg-card-alt rounded cursor-pointer" title="Excluir">
                        <Trash2 size={14} className="text-text-muted" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Download size={14} /> Exportar relatório</Button>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-text-muted">
                {ambiente ? 'Notas com valor fiscal' : 'Notas em homologação'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ────────── CERTIFICADO ────────── */}
      {tab === 'certificado' && (
        <div className="space-y-4">
          <Card header={<span className="font-heading text-base font-medium">Certificado Digital A1</span>}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-success-pale flex items-center justify-center">
                  <Shield size={28} className="text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Certificado ICP-Brasil A1</h3>
                  <p className="text-sm text-text-secondary">Emissor: Soluti · Válido até 15/08/2026</p>
                  <p className="text-xs text-text-muted">CNPJ: 12.345.678/0001-90 · Dr. Carlos Mendes</p>
                </div>
              </div>
              <Badge variant="green"><CheckCircle size={12} /> Ativo</Badge>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <div><p className="text-xs text-text-muted">Tipo</p><p className="text-sm font-medium text-text-primary">A1 (arquivo)</p></div>
              <div><p className="text-xs text-text-muted">Validade</p><p className="text-sm font-medium text-text-primary">95 dias</p></div>
              <div><p className="text-xs text-text-muted">SEFAZ</p><p className="text-sm font-medium text-text-primary">Autorizado</p></div>
              <div><p className="text-xs text-text-muted">Último uso</p><p className="text-sm font-medium text-text-primary">12/05/2026</p></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm"><Upload size={14} /> Substituir certificado</Button>
              <Button variant="danger" size="sm">Remover</Button>
            </div>
          </Card>

          <Card header={<span className="font-heading text-base font-medium">Renovação automática</span>}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-text-secondary">Ativar renovação automática 30 dias antes do vencimento.</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:bg-blue-brand after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </Card>

          <Card header={<span className="font-heading text-base font-medium">Adquirir certificado</span>}>
            <p className="text-sm text-text-secondary mb-4">Não tem certificado? Adquira diretamente de uma certificadora credenciada ICP-Brasil.</p>
            <div className="grid grid-cols-4 gap-3">
              {['Soluti', 'Certisign', 'Serpro', 'Valid'].map((cert) => (
                <button key={cert} className="p-3 rounded-lg border border-border text-center hover:border-blue-brand hover:bg-blue-pale/30 transition-all cursor-pointer">
                  <Shield size={24} className="mx-auto text-blue-mid mb-1" />
                  <p className="text-xs font-medium text-text-primary">{cert}</p>
                  <p className="text-[10px] text-text-muted">ICP-Brasil</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ────────── EMITIR MODAL ────────── */}
      <Modal open={showEmitir} onClose={() => setShowEmitir(false)} title={`Emitir ${emissaoTipo === 'servico' ? 'NFS-e' : 'NF-e'}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setEmissaoTipo('servico')}
              className={`flex-1 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${emissaoTipo === 'servico' ? 'border-blue-brand bg-blue-pale/30 text-blue-brand' : 'border-border text-text-secondary'}`}>
              <FileText size={16} className="mx-auto mb-1" /> Serviço
            </button>
            <button onClick={() => setEmissaoTipo('produto')}
              className={`flex-1 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${emissaoTipo === 'produto' ? 'border-blue-brand bg-blue-pale/30 text-blue-brand' : 'border-border text-text-secondary'}`}>
              <Package size={16} className="mx-auto mb-1" /> Produto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tomador</label>
              <input value={form.tomador} onChange={e => setForm(p => ({ ...p, tomador: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="Nome / Razão social" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">CPF/CNPJ</label>
              <input value={form.cpfCnpj} onChange={e => setForm(p => ({ ...p, cpfCnpj: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="000.000.000-00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{emissaoTipo === 'servico' ? 'Descrição do serviço' : 'Descrição do produto'}</label>
            <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder={emissaoTipo === 'servico' ? 'Ex: Consulta, Exame, Procedimento' : 'Ex: Luvas, Seringas, Medicamentos'} />
          </div>

          {emissaoTipo === 'produto' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Quantidade</label>
                <input type="number" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">NCM</label>
                <input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0000.00.00" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0,00" />
            </div>
          </div>

          <div className="bg-blue-pale rounded-lg p-3 text-xs text-blue-mid flex items-start gap-2">
            <FlaskConical size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              {ambiente
                ? 'Esta nota será emitida em PRODUÇÃO com valor fiscal real. Certifique-se dos dados antes de autorizar.'
                : 'Esta nota será emitida em HOMOLOGAÇÃO — sem valor fiscal, apenas para testes.'
              }
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowEmitir(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleEmitir}><Send size={16} /> Autorizar emissão</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
