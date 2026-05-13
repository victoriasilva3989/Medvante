import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import {
  DollarSign, TrendingUp, Plus,
  CheckCircle, AlertTriangle, Clock, Download,
  RefreshCw, Eye, EyeOff, FileText,
  Landmark, Filter
} from 'lucide-react'

interface ContaReceber {
  id: string; paciente: string; convenio?: string; procedimento: string
  dataEmissao: string; dataVencimento: string; valor: number
  status: 'pendente' | 'parcial' | 'recebido' | 'atrasado'
  diasAtraso: number; tipo: 'particular' | 'convenio'
}

interface ContaPagar {
  id: string; descricao: string; categoria: string
  dataVencimento: string; valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  diasAtraso: number; fornecedor?: string
}

interface ExtratoItem {
  id: string; data: string; descricao: string
  valor: number; tipo: 'credito' | 'debito'; conciliado: boolean
}

const mockContasReceber: ContaReceber[] = [
  { id: 'cr1', paciente: 'Maria da Silva', procedimento: 'Consulta', dataEmissao: '15/01/2026', dataVencimento: '15/04/2026', valor: 350, status: 'pendente', diasAtraso: 27, tipo: 'particular' },
  { id: 'cr2', paciente: 'João Santos', convenio: 'UNIMED', procedimento: 'Eletrocardiograma', dataEmissao: '15/01/2026', dataVencimento: '15/04/2026', valor: 180, status: 'atrasado', diasAtraso: 87, tipo: 'convenio' },
  { id: 'cr3', paciente: 'Fernanda Rocha', procedimento: 'Consulta', dataEmissao: '20/02/2026', dataVencimento: '20/05/2026', valor: 350, status: 'pendente', diasAtraso: 0, tipo: 'particular' },
  { id: 'cr4', paciente: 'Roberto Lima', convenio: 'Amil', procedimento: 'Exame de Sangue', dataEmissao: '05/02/2026', dataVencimento: '05/05/2026', valor: 420, status: 'atrasado', diasAtraso: 92, tipo: 'convenio' },
  { id: 'cr5', paciente: 'Rafael Torres', convenio: 'UNIMED', procedimento: 'Consulta', dataEmissao: '10/01/2026', dataVencimento: '10/04/2026', valor: 300, status: 'atrasado', diasAtraso: 97, tipo: 'convenio' },
  { id: 'cr6', paciente: 'Lucia Oliveira', procedimento: 'Teleconsulta', dataEmissao: '01/03/2026', dataVencimento: '01/06/2026', valor: 250, status: 'pendente', diasAtraso: 0, tipo: 'particular' },
  { id: 'cr7', paciente: 'Carlos Eduardo', convenio: 'Bradesco Saúde', procedimento: 'Procedimento', dataEmissao: '01/02/2026', dataVencimento: '01/05/2026', valor: 850, status: 'parcial', diasAtraso: 11, tipo: 'convenio' },
  { id: 'cr8', paciente: 'Amanda Souza', procedimento: 'Cirurgia', dataEmissao: '15/12/2025', dataVencimento: '15/03/2026', valor: 3500, status: 'atrasado', diasAtraso: 58, tipo: 'particular' },
]

const mockContasPagar: ContaPagar[] = [
  { id: 'cp1', descricao: 'Aluguel Consultório', categoria: 'Despesas Fixas', dataVencimento: '05/05/2026', valor: 3200, status: 'pendente', diasAtraso: 0, fornecedor: 'Imobiliária Centro' },
  { id: 'cp2', descricao: 'Salário Secretária', categoria: 'Folha', dataVencimento: '30/04/2026', valor: 2500, status: 'pago', diasAtraso: 0 },
  { id: 'cp3', descricao: 'Material Descartável', categoria: 'Insumos', dataVencimento: '10/04/2026', valor: 890, status: 'atrasado', diasAtraso: 32, fornecedor: 'Distribuidora Saúde' },
  { id: 'cp4', descricao: 'Conta de Energia', categoria: 'Despesas Fixas', dataVencimento: '15/05/2026', valor: 450, status: 'pendente', diasAtraso: 0 },
  { id: 'cp5', descricao: 'Internet + Telefone', categoria: 'Despesas Fixas', dataVencimento: '10/04/2026', valor: 320, status: 'atrasado', diasAtraso: 32 },
  { id: 'cp6', descricao: 'Material de Escritório', categoria: 'Insumos', dataVencimento: '20/05/2026', valor: 230, status: 'pendente', diasAtraso: 0 },
  { id: 'cp7', descricao: 'Condomínio', categoria: 'Despesas Fixas', dataVencimento: '10/04/2026', valor: 980, status: 'atrasado', diasAtraso: 32 },
  { id: 'cp8', descricao: 'Assinatura Medvante', categoria: 'Serviços', dataVencimento: '01/06/2026', valor: 497, status: 'pendente', diasAtraso: 0 },
]

const mockExtrato: ExtratoItem[] = [
  { id: 'ex1', data: '12/05/2026', descricao: 'PIX Recebido - Maria Silva', valor: 350, tipo: 'credito', conciliado: true },
  { id: 'ex2', data: '12/05/2026', descricao: 'Pagamento Boleto - Aluguel', valor: 3200, tipo: 'debito', conciliado: true },
  { id: 'ex3', data: '11/05/2026', descricao: 'Repasse UNIMED Lote 3456', valor: 12400, tipo: 'credito', conciliado: false },
  { id: 'ex4', data: '10/05/2026', descricao: 'PIX Enviado - Material', valor: 890, tipo: 'debito', conciliado: false },
  { id: 'ex5', data: '09/05/2026', descricao: 'Recebimento Cartão - Consultas', valor: 2800, tipo: 'credito', conciliado: true },
]

export function FinanceiroPage() {
  const [tab, setTab] = useState('visao-geral')
  const [contasReceber, setContasReceber] = useState(mockContasReceber)
  const [contasPagar, setContasPagar] = useState(mockContasPagar)
  const [extrato, setExtrato] = useState(mockExtrato)
  const [showAddReceber, setShowAddReceber] = useState(false)
  const [showAddPagar, setShowAddPagar] = useState(false)
  const [showConciliar, setShowConciliar] = useState(false)
  const [saldoVisivel, setSaldoVisivel] = useState(true)

  const totalReceber = contasReceber.reduce((a, b) => a + b.valor, 0)
  const totalPagar = contasPagar.filter(c => c.status !== 'pago').reduce((a, b) => a + b.valor, 0)
  const totalAtrasado = contasReceber.filter(c => c.status === 'atrasado').reduce((a, b) => a + b.valor, 0)
  const totalPagarAtrasado = contasPagar.filter(c => c.status === 'atrasado').reduce((a, b) => a + b.valor, 0)
  const emAtrasoCritico = contasReceber.filter(c => c.diasAtraso >= 90)

  const tabs = [
    { key: 'visao-geral', label: 'Visão Geral' },
    { key: 'fluxo', label: 'Fluxo de Caixa' },
    { key: 'contas-receber', label: 'Contas a Receber' },
    { key: 'contas-pagar', label: 'Contas a Pagar' },
    { key: 'conciliacao', label: 'Conciliação Bancária' },
    { key: 'guias', label: 'Guias e Impostos' },
  ]

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* ═══════ VISÃO GERAL ═══════ */}
      {tab === 'visao-geral' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Saldo disponível</p>
                  <p className="text-2xl font-semibold text-text-primary mt-1">{saldoVisivel ? 'R$ 32.450,00' : '••••••'}</p>
                  <button onClick={() => setSaldoVisivel(!saldoVisivel)} className="text-xs text-blue-brand mt-1 flex items-center gap-1 cursor-pointer">
                    {saldoVisivel ? <EyeOff size={12} /> : <Eye size={12} />} {saldoVisivel ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><DollarSign size={20} className="text-blue-brand" /></div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-success"><TrendingUp size={14} /> +5.2% vs mês anterior</div>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">A receber (pendente)</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">R$ {totalReceber.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-danger"><AlertTriangle size={14} /> R$ {totalAtrasado.toFixed(2)} em atraso</div>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">A pagar (pendente)</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">R$ {totalPagar.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-danger"><AlertTriangle size={14} /> R$ {totalPagarAtrasado.toFixed(2)} vencidos</div>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Saldo projetado</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">R$ {(32450 - totalPagar + totalReceber).toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-text-muted"><Clock size={14} /> Considerando pendências</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card header={<span className="font-heading text-base font-medium">⏰ Atraso crítico (&gt; 90 dias — convênios)</span>}>
              {emAtrasoCritico.length === 0 ? (
                <p className="text-sm text-text-secondary">Nenhuma conta com atraso crítico.</p>
              ) : (
                <div className="space-y-2">
                  {emAtrasoCritico.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-danger-pale border border-danger/20">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{c.paciente}</p>
                        <p className="text-xs text-text-secondary">{c.convenio || 'Particular'} · {c.procedimento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-danger">R$ {c.valor.toFixed(2)}</p>
                        <p className="text-xs font-medium text-danger">{c.diasAtraso} dias sem pagamento</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card header={<span className="font-heading text-base font-medium">📊 Resumo do mês</span>}>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-border"><span className="text-sm text-text-secondary">Faturamento bruto</span><span className="text-sm font-semibold text-text-primary">R$ 48.250,00</span></div>
                <div className="flex justify-between pb-2 border-b border-border"><span className="text-sm text-text-secondary">Glosas</span><span className="text-sm font-semibold text-danger">- R$ 1.500,00</span></div>
                <div className="flex justify-between pb-2 border-b border-border"><span className="text-sm text-text-secondary">Despesas</span><span className="text-sm font-semibold text-danger">- R$ 15.700,00</span></div>
                <div className="flex justify-between pt-1"><span className="text-sm font-medium text-text-primary">Resultado líquido</span><span className="text-sm font-bold text-success">R$ 31.050,00</span></div>
              </div>
            </Card>
          </div>

          <Card header={
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-medium">Últimos lançamentos</span>
              <Button variant="primary" size="sm" onClick={() => setShowAddReceber(true)}><Plus size={14} /> Novo</Button>
            </div>
          }>
            <Table headers={['Data', 'Descrição', 'Tipo', 'Valor', 'Status']}>
              {[...contasReceber.map(c => ({ data: c.dataEmissao, desc: c.paciente + ' - ' + c.procedimento, tipo: 'receita' as const, valor: c.valor, status: c.status })),
                ...contasPagar.map(c => ({ data: c.dataVencimento, desc: c.descricao, tipo: 'despesa' as const, valor: c.valor, status: c.status }))
              ].slice(0, 8).map((item, i) => (
                <tr key={i} className="hover:bg-blue-pale">
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.data}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{item.desc}</td>
                  <td className="px-4 py-3"><Badge variant={item.tipo === 'receita' ? 'green' : 'red'}>{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</Badge></td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {item.valor.toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={item.status === 'recebido' || item.status === 'pago' ? 'green' : item.status === 'atrasado' ? 'red' : 'amber'}>{item.status}</Badge></td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {/* ═══════ FLUXO DE CAIXA ═══════ */}
      {tab === 'fluxo' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><p className="text-sm text-text-secondary">Saldo inicial (mês)</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 28.400,00</p></Card>
            <Card><p className="text-sm text-text-secondary">Entradas do mês</p><p className="text-xl font-semibold text-success mt-1">R$ 48.250,00</p></Card>
            <Card><p className="text-sm text-text-secondary">Saídas do mês</p><p className="text-xl font-semibold text-danger mt-1">R$ 15.700,00</p></Card>
          </div>
          <Card header={<div className="flex items-center justify-between"><span className="font-heading text-base font-medium">Fluxo de Caixa Diário</span><Button variant="secondary" size="sm"><Download size={14} /> Exportar</Button></div>}>
            <div className="h-64 bg-bg-card-alt rounded-lg flex items-center justify-center text-text-muted text-sm">Gráfico de fluxo de caixa com saldo diário</div>
          </Card>
          <Card header={<span className="font-heading text-base font-medium">Projeção para 30 dias</span>}>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-success-pale"><p className="text-xs text-text-secondary">Previsto receber</p><p className="text-lg font-semibold text-success">R$ 12.450,00</p></div>
              <div className="p-4 rounded-lg bg-danger-pale"><p className="text-xs text-text-secondary">Previsto pagar</p><p className="text-lg font-semibold text-danger">R$ 8.970,00</p></div>
              <div className="p-4 rounded-lg bg-blue-pale"><p className="text-xs text-text-secondary">Saldo projetado</p><p className="text-lg font-semibold text-blue-brand">R$ 35.930,00</p></div>
            </div>
          </Card>
        </>
      )}

      {/* ═══════ CONTAS A RECEBER ═══════ */}
      {tab === 'contas-receber' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button variant="secondary" size="sm"><Filter size={14} /> Filtrar</Button>
              <Button variant="secondary" size="sm"><Download size={14} /> Exportar</Button>
            </div>
            <Button variant="primary" onClick={() => setShowAddReceber(true)}><Plus size={16} /> Nova conta</Button>
          </div>
          <Card header={<div className="flex items-center justify-between"><span className="font-heading text-base font-medium">Contas a Receber</span><span className="text-sm text-text-muted">{contasReceber.filter(c => c.status !== 'recebido').length} pendentes</span></div>}>
            <Table headers={['Paciente', 'Procedimento', 'Tipo', 'Vencimento', 'Valor', 'Dias atraso', 'Status', '']}>
              {contasReceber.map(c => (
                <tr key={c.id} className="hover:bg-blue-pale">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.paciente}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.procedimento}</td>
                  <td className="px-4 py-3"><Badge variant={c.tipo === 'convenio' ? 'blue' : 'green'}>{c.tipo}{c.convenio ? ` · ${c.convenio}` : ''}</Badge></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.dataVencimento}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {c.valor.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {c.status === 'recebido' ? <span className="text-xs text-text-muted">-</span> : (
                      <span className={`text-xs font-medium flex items-center gap-1 ${c.diasAtraso >= 90 ? 'text-danger font-bold' : c.diasAtraso > 0 ? 'text-warning' : 'text-text-muted'}`}>
                        <Clock size={12} />
                        {c.diasAtraso > 0 ? `${c.diasAtraso}d` : 'A vencer'}
                        {c.diasAtraso >= 90 && ' ⚠️ 90d+'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge variant={c.status === 'recebido' ? 'green' : c.status === 'atrasado' ? 'red' : c.status === 'parcial' ? 'blue' : 'amber'}>{c.status}</Badge></td>
                  <td className="px-4 py-3">
                    {c.status !== 'recebido' && (
                      <Button variant="ghost" size="sm" onClick={() => setContasReceber(contasReceber.map(r => r.id === c.id ? { ...r, status: 'recebido' } : r))}>
                        <CheckCircle size={14} className="text-success" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card className="bg-warning-pale border-warning/30">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-warning text-sm">Prazo médio de recebimento de convênios: 92 dias</h4>
                <p className="text-xs text-text-secondary mt-1">Operadoras de saúde têm prazo médio de 90 dias para repasse. O Medvante acompanha e dispara alertas quando o prazo ultrapassa 85 dias.</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ═══════ CONTAS A PAGAR ═══════ */}
      {tab === 'contas-pagar' && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="primary" onClick={() => setShowAddPagar(true)}><Plus size={16} /> Nova conta</Button>
          </div>
          <Card header={<div className="flex items-center justify-between"><span className="font-heading text-base font-medium">Contas a Pagar</span><span className="text-sm text-text-muted">{contasPagar.filter(c => c.status !== 'pago').length} pendentes</span></div>}>
            <Table headers={['Descrição', 'Categoria', 'Vencimento', 'Valor', 'Atraso', 'Status', '']}>
              {contasPagar.map(c => (
                <tr key={c.id} className="hover:bg-blue-pale">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.descricao}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.categoria}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{c.dataVencimento}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {c.valor.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {c.status === 'pago' ? <span className="text-xs text-text-muted">-</span> : (
                      <span className={`text-xs font-medium flex items-center gap-1 ${c.diasAtraso > 0 ? 'text-danger' : 'text-text-muted'}`}>
                        <Clock size={12} /> {c.diasAtraso > 0 ? `${c.diasAtraso}d atraso` : 'A vencer'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge variant={c.status === 'pago' ? 'green' : c.status === 'atrasado' ? 'red' : 'amber'}>{c.status}</Badge></td>
                  <td className="px-4 py-3">
                    {c.status !== 'pago' && (
                      <Button variant="ghost" size="sm" onClick={() => setContasPagar(contasPagar.map(p => p.id === c.id ? { ...p, status: 'pago', diasAtraso: 0 } : p))}>
                        <CheckCircle size={14} className="text-success" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {/* ═══════ CONCILIAÇÃO BANCÁRIA ═══════ */}
      {tab === 'conciliacao' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card><p className="text-sm text-text-secondary">Total no extrato</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 47.250,00</p></Card>
            <Card><p className="text-sm text-text-secondary">Conciliado</p><p className="text-xl font-semibold text-success mt-1">R$ 32.450,00</p></Card>
            <Card><p className="text-sm text-text-secondary">A conciliar</p><p className="text-xl font-semibold text-warning mt-1">R$ 14.800,00</p></Card>
            <Card><p className="text-sm text-text-secondary">Divergências</p><p className="text-xl font-semibold text-danger mt-1">R$ 0,00</p></Card>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="primary" onClick={() => setShowConciliar(true)}><RefreshCw size={14} /> Importar extrato (Open Finance)</Button>
            <Button variant="secondary"><Download size={14} /> Exportar</Button>
          </div>
          <Card header={<div className="flex items-center justify-between"><span className="font-heading text-base font-medium">Extrato Bancário — NuBank</span><span className="text-xs text-text-muted flex items-center gap-1"><RefreshCw size={12} /> 12/05/2026 14:30</span></div>}>
            <Table headers={['Data', 'Descrição', 'Valor', 'Tipo', 'Conciliação', '']}>
              {extrato.map(e => (
                <tr key={e.id} className="hover:bg-blue-pale">
                  <td className="px-4 py-3 text-sm text-text-secondary">{e.data}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{e.descricao}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${e.tipo === 'credito' ? 'text-success' : 'text-danger'}`}>{e.tipo === 'credito' ? '+' : '-'}R$ {e.valor.toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={e.tipo === 'credito' ? 'green' : 'red'}>{e.tipo === 'credito' ? 'Crédito' : 'Débito'}</Badge></td>
                  <td className="px-4 py-3">{e.conciliado ? <Badge variant="green"><CheckCircle size={12} /> Conciliado</Badge> : <Badge variant="amber"><AlertTriangle size={12} /> Pendente</Badge>}</td>
                  <td className="px-4 py-3">{!e.conciliado && <Button variant="ghost" size="sm" onClick={() => setExtrato(extrato.map(x => x.id === e.id ? { ...x, conciliado: true } : x))}><CheckCircle size={14} className="text-success" /></Button>}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card header={<span className="font-heading text-base font-medium">💡 Sugestões automáticas</span>}>
            <div className="space-y-2">
              {extrato.filter(e => !e.conciliado).map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-success-pale">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-success" />
                    <div><p className="text-sm text-text-primary">{e.descricao}</p><p className="text-xs text-text-secondary">Extrato: R$ {e.valor.toFixed(2)}</p></div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setExtrato(extrato.map(x => x.id === e.id ? { ...x, conciliado: true } : x))}>Conciliar</Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ═══════ GUIAS E IMPOSTOS ═══════ */}
      {tab === 'guias' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card><p className="text-sm text-text-secondary">Impostos do mês</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 6.250,00</p></Card>
            <Card><p className="text-sm text-text-secondary">Pró-labore</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 12.000,00</p></Card>
            <Card><p className="text-sm text-text-secondary">INSS</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 1.320,00</p></Card>
            <Card><p className="text-sm text-text-secondary">DAS/Simples</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 2.890,00</p></Card>
          </div>
          <Card header={<span className="font-heading text-base font-medium">Guias de Imposto</span>}>
            <Table headers={['Guia', 'Competência', 'Valor', 'Vencimento', 'Status', '']}>
              {[
                { guia: 'DAS - Simples Nacional', competencia: '04/2026', valor: 2890, venc: '20/05/2026', status: 'pendente' },
                { guia: 'INSS - Folha', competencia: '04/2026', valor: 1320, venc: '15/05/2026', status: 'pendente' },
                { guia: 'IRPF - Carnê-leão', competencia: '04/2026', valor: 1850, venc: '30/05/2026', status: 'pendente' },
                { guia: 'ISS', competencia: '03/2026', valor: 520, venc: '15/04/2026', status: 'pago' },
              ].map((g, i) => (
                <tr key={i} className="hover:bg-blue-pale">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{g.guia}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{g.competencia}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">R$ {g.valor.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{g.venc}</td>
                  <td className="px-4 py-3"><Badge variant={g.status === 'pendente' ? 'amber' : 'green'}>{g.status}</Badge></td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm"><FileText size={14} /> 2ª via</Button></td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card header={<span className="font-heading text-base font-medium">DMED — Declaração de Serviços Médicos</span>}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-text-secondary">Ano-base 2025 · 187 atendimentos declarados</p><p className="text-xs text-text-muted mt-1">Enviada à Receita Federal em 28/02/2026</p></div>
              <Badge variant="green"><CheckCircle size={12} /> Entregue</Badge>
            </div>
          </Card>
        </>
      )}

      {/* New Receber Modal */}
      <Modal open={showAddReceber} onClose={() => setShowAddReceber(false)} title="Nova conta a receber">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Paciente</label><input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="Nome" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label><input type="number" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="0,00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Procedimento</label><input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand"><option>Particular</option><option>Convênio</option></select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Emissão</label><input type="date" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Vencimento</label><input type="date" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddReceber(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={() => setShowAddReceber(false)}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* New Pagar Modal */}
      <Modal open={showAddPagar} onClose={() => setShowAddPagar(false)} title="Nova conta a pagar">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Descrição</label><input className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label><input type="number" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Categoria</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand"><option>Despesas Fixas</option><option>Insumos</option><option>Folha</option><option>Serviços</option><option>Impostos</option></select>
            </div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Vencimento</label><input type="date" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddPagar(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={() => setShowAddPagar(false)}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* Open Finance Modal */}
      <Modal open={showConciliar} onClose={() => setShowConciliar(false)} title="Importar extrato via Open Finance">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Selecione a conta para importar:</p>
          {[{ banco: 'NuBank', saldo: 'R$ 12.890,50' }, { banco: 'Banco do Brasil', saldo: 'R$ 32.450,00' }].map(c => (
            <div key={c.banco} className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:border-blue-brand">
              <div className="flex items-center gap-3">
                <Landmark size={18} className="text-blue-mid" />
                <div><p className="text-sm font-medium text-text-primary">{c.banco}</p><p className="text-xs text-text-muted">Saldo: {c.saldo}</p></div>
              </div>
              <Button variant="primary" size="sm" onClick={() => { setShowConciliar(false); setExtrato([...extrato, { id: `ex${Date.now()}`, data: '12/05/2026', descricao: `Novo extrato ${c.banco}`, valor: Math.round(Math.random() * 5000), tipo: 'credito', conciliado: false }]) }}><RefreshCw size={12} /> Importar</Button>
            </div>
          ))}
          <div className="bg-blue-pale rounded-lg p-3 text-xs text-blue-mid flex items-start gap-2">
            <RefreshCw size={14} className="mt-0.5 flex-shrink-0" />
            <span>Extrato importado automaticamente via Open Finance com sugestões de conciliação.</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
