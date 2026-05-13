import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import {
  Plus, FileText, Package, FlaskConical, Upload,
  Shield, CheckCircle, Download, Send,
  ToggleLeft, ToggleRight, Eye
} from 'lucide-react'

const mockNotasServico = [
  { id: 'ns1', numero: 'NFS-e-2024-0001', data: '15/03/2024', tomador: 'Maria da Silva', servico: 'Consulta', valor: 350, status: 'autorizada', ambiente: 'producao' },
  { id: 'ns2', numero: 'NFS-e-2024-0002', data: '16/03/2024', tomador: 'João Santos', servico: 'Eletrocardiograma', valor: 180, status: 'autorizada', ambiente: 'producao' },
  { id: 'ns3', numero: 'NFS-e-2024-0003', data: '16/03/2024', tomador: 'Ana Costa', servico: 'Retorno', valor: 200, status: 'cancelada', ambiente: 'producao' },
  { id: 'ns4', numero: 'NFS-e-2024-0004', data: '20/03/2024', tomador: 'Roberto Lima', servico: 'Exame', valor: 420, status: 'pendente', ambiente: 'homologacao' },
]

const mockNotasProduto = [
  { id: 'np1', numero: 'NF-e-2024-0001', data: '15/03/2024', tomador: 'Farmácia Saúde', produto: 'Luvas descartáveis (cx)', quantidade: 10, valor: 325, status: 'autorizada', ambiente: 'producao' },
  { id: 'np2', numero: 'NF-e-2024-0002', data: '18/03/2024', tomador: 'Clínica Bem Estar', produto: 'Seringas 5ml (cx)', quantidade: 5, valor: 94.50, status: 'autorizada', ambiente: 'producao' },
]

type NotaItem = {
  id: string; numero: string; data: string; tomador: string; servico?: string; produto?: string; quantidade?: number; valor: number; status: string; ambiente: string
}

export function NotaFiscalPage() {
  const [tab, setTab] = useState('servico')
  const [ambienteProducao, setAmbienteProducao] = useState(true)
  const [showEmitir, setShowEmitir] = useState(false)
  const [emissaoTipo, setEmissaoTipo] = useState<'servico' | 'produto'>('servico')

  const currentList = tab === 'servico' ? mockNotasServico : mockNotasProduto

  const statusVariant = (status: string) => {
    switch (status) {
      case 'autorizada': return 'green' as const
      case 'pendente': return 'amber' as const
      case 'cancelada': return 'red' as const
      case 'rejeitada': return 'red' as const
      default: return 'blue' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Environment Toggle + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmbienteProducao(!ambienteProducao)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              ambienteProducao 
                ? 'bg-blue-brand text-white' 
                : 'bg-warning-pale text-warning border border-warning/30'
            }`}
          >
            {ambienteProducao ? <Shield size={16} /> : <FlaskConical size={16} />}
            {ambienteProducao ? 'Produção' : 'Homologação'}
            {ambienteProducao ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          {!ambienteProducao && (
            <span className="text-xs text-warning bg-warning-pale px-3 py-1 rounded-full border border-warning/30">
              Ambiente de testes — notas sem valor fiscal
            </span>
          )}
        </div>
        <Button variant="primary" onClick={() => { setEmissaoTipo(tab as 'servico' | 'produto'); setShowEmitir(true) }}>
          <Plus size={16} /> Emitir {tab === 'servico' ? 'NFS-e' : 'NF-e'}
        </Button>
      </div>

      {/* Certificate Status */}
      <div className={`p-3 rounded-lg border flex items-center justify-between ${
        ambienteProducao 
          ? 'bg-success-pale border-success/20 text-success' 
          : 'bg-warning-pale border-warning/20 text-warning'
      }`}>
        <div className="flex items-center gap-2 text-sm">
          <Shield size={16} />
          <span>
            {ambienteProducao 
              ? 'Certificado A1 ativo — válido até 15/08/2026 (95 dias)' 
              : 'Homologação — nenhum certificado real é exigido pela SEFAZ para testes'
            }
          </span>
        </div>
        <Button variant="ghost" size="sm" className={ambienteProducao ? '!text-success' : '!text-warning'}>
          <Eye size={14} /> Detalhes
        </Button>
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
          <Table headers={['Número', 'Data', 'Tomador', tab === 'servico' ? 'Serviço' : 'Produto', tab === 'produto' ? 'Qtd' : '', 'Valor', 'Ambiente', 'Status']}>
            {currentList.map((nf: NotaItem) => (
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
              </tr>
            ))}
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Download size={14} /> Exportar relatório</Button>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-text-muted">
                {ambienteProducao ? 'Notas com valor fiscal' : 'Notas em homologação'}
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
              <div>
                <p className="text-xs text-text-muted">Tipo</p>
                <p className="text-sm font-medium text-text-primary">A1 (arquivo)</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Validade</p>
                <p className="text-sm font-medium text-text-primary">95 dias</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">SEFAZ</p>
                <p className="text-sm font-medium text-text-primary">Autorizado</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Último uso</p>
                <p className="text-sm font-medium text-text-primary">12/05/2026</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm"><Upload size={14} /> Substituir certificado</Button>
              <Button variant="danger" size="sm">Remover</Button>
            </div>
          </Card>

          {/* Renovação */}
          <Card header={<span className="font-heading text-base font-medium">Renovação automática</span>}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ativar renovação automática 30 dias antes do vencimento.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:bg-blue-brand after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </Card>

          {/* Certificadora */}
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
            <button onClick={() => setEmissaoTipo('servico')} className={`flex-1 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${emissaoTipo === 'servico' ? 'border-blue-brand bg-blue-pale/30 text-blue-brand' : 'border-border text-text-secondary'}`}>
              <FileText size={16} className="mx-auto mb-1" /> Serviço
            </button>
            <button onClick={() => setEmissaoTipo('produto')} className={`flex-1 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${emissaoTipo === 'produto' ? 'border-blue-brand bg-blue-pale/30 text-blue-brand' : 'border-border text-text-secondary'}`}>
              <Package size={16} className="mx-auto mb-1" /> Produto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tomador</label>
              <input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="Nome / Razão social" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">CPF/CNPJ</label>
              <input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="000.000.000-00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{emissaoTipo === 'servico' ? 'Descrição do serviço' : 'Descrição do produto'}</label>
            <input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder={emissaoTipo === 'servico' ? 'Ex: Consulta, Exame, Procedimento' : 'Ex: Luvas, Seringas, Medicamentos'} />
          </div>

          {emissaoTipo === 'produto' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Quantidade</label>
                <input type="number" defaultValue={1} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">NCM</label>
                <input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0000.00.00" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor unitário (R$)</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor total (R$)</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0,00" />
            </div>
          </div>

          <div className="bg-blue-pale rounded-lg p-3 text-xs text-blue-mid flex items-start gap-2">
            <FlaskConical size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              {ambienteProducao 
                ? 'Esta nota será emitida em PRODUÇÃO com valor fiscal real. Certifique-se dos dados antes de autorizar.'
                : 'Esta nota será emitida em HOMOLOGAÇÃO — sem valor fiscal, apenas para testes.'
              }
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowEmitir(false)}>Cancelar</Button>
            <Button className="flex-1"><Send size={16} /> Autorizar emissão</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
