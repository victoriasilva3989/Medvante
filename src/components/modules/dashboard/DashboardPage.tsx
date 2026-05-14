import { useMemo } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import {
  DollarSign, Calendar, Users, Wallet,
  FileText, Receipt, Info
} from 'lucide-react'
import { useFaturamentoStore } from '../../../store/faturamentoStore'
import { useBankStore } from '../../../store/bankStore'
import { useTrialStore } from '../../../store/trialStore'
import type { Appointment } from '../../../types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'

function lerAtendimentos(): Appointment[] {
  try {
    const data = localStorage.getItem('medvante-atendimentos')
    if (data) return JSON.parse(data) as Appointment[]
  } catch {}
  return []
}

function isHoje(dataISO: string): boolean {
  const hoje = new Date()
  return dataISO === hoje.toISOString().split('T')[0]
}

const hoje = new Date()
const anoAtual = hoje.getFullYear()
const mesAtual = hoje.getMonth() + 1

export function DashboardPage() {
  const {
    aliquota, regimeTributario,
    getFaturamentoBrutoMes, getFaturamentoLiquidoMes, getImpostoRetidoMes,
    getTotalNotasMes, getFaturamentoPorMes
  } = useFaturamentoStore()

  const { getSaldoTotal } = useBankStore()
  const { planStatus, getDaysRemaining } = useTrialStore()

  const dados = useMemo(() => {
    const bruto = getFaturamentoBrutoMes(anoAtual, mesAtual)
    const imposto = getImpostoRetidoMes(anoAtual, mesAtual)
    const liquido = getFaturamentoLiquidoMes(anoAtual, mesAtual)
    const totalNotas = getTotalNotasMes(anoAtual, mesAtual)
    const chartData = getFaturamentoPorMes(6)
    const saldo = getSaldoTotal()
    return { bruto, imposto, liquido, totalNotas, chartData, saldo }
  }, [getFaturamentoBrutoMes, getFaturamentoLiquidoMes, getImpostoRetidoMes, getTotalNotasMes, getFaturamentoPorMes, getSaldoTotal])

  const appointments = useMemo(() => lerAtendimentos(), [])
  const totalAtendimentos = appointments.length
  const appointmentsHoje = appointments.filter(a => isHoje(a.data))
  const ticketMedio = totalAtendimentos > 0
    ? appointments.reduce((a, b) => a + b.valor, 0) / totalAtendimentos
    : 0

  const regimeLabel: Record<string, string> = {
    simples_nacional: 'Simples Nacional',
    lucro_presumido: 'Lucro Presumido',
    lucro_real: 'Lucro Real',
    mei: 'MEI',
  }

  const alerts = useMemo(() => {
    const a: { type: 'danger' | 'warning' | 'info'; title: string; desc: string }[] = []

    if (planStatus === 'expired') {
      a.push({ type: 'danger', title: 'Trial expirado', desc: 'Seu período de teste terminou. Assine um plano para continuar usando o sistema.' })
    } else if (planStatus === 'trial' && getDaysRemaining() <= 3) {
      a.push({ type: 'warning', title: 'Trial terminando', desc: `Seu período gratuito termina em ${getDaysRemaining()} dias. Assine agora para não perder o acesso.` })
    }

    if (dados.bruto <= 0) {
      a.push({ type: 'warning', title: 'Nenhuma nota emitida', desc: 'Você ainda não emitiu nenhuma nota fiscal este mês.' })
    }

    if (totalAtendimentos === 0) {
      a.push({ type: 'info', title: 'Nenhum atendimento', desc: 'Cadastre atendimentos no módulo "Atendimentos" para acompanhar sua produtividade.' })
    }

    if (dados.saldo <= 0) {
      a.push({ type: 'info', title: 'Conectar bancos', desc: 'Conecte suas contas no módulo "Integrações > Open Finance" para ver o saldo.' })
    }

    return a
  }, [dados.bruto, dados.saldo, totalAtendimentos, planStatus, getDaysRemaining])

  const stats = [
    {
      label: 'Faturamento Bruto',
      value: `R$ ${dados.bruto.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-brand',
      detail: `${dados.totalNotas} nota(s) emitida(s) · Alíquota ${aliquota}%`,
    },
    {
      label: 'Imposto Retido',
      value: `R$ ${dados.imposto.toFixed(2)}`,
      icon: Receipt,
      color: 'text-warning',
      detail: `${regimeLabel[regimeTributario]}`,
    },
    {
      label: 'Faturamento Líquido',
      value: `R$ ${dados.liquido.toFixed(2)}`,
      icon: Wallet,
      color: 'text-success',
      detail: 'Após dedução de impostos',
    },
    {
      label: 'Saldo Disponível',
      value: `R$ ${dados.saldo.toFixed(2)}`,
      icon: Wallet,
      color: 'text-blue-brand',
      detail: dados.saldo > 0 ? 'Open Finance · Saldo consolidado' : 'Nenhuma conta conectada',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-semibold text-text-primary mt-1 font-[Outfit]">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{stat.detail}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Segunda linha: Ticket médio + Total atendimentos */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total de Atendimentos</p>
              <p className="text-2xl font-semibold text-text-primary mt-1 font-[Outfit]">{totalAtendimentos}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {totalAtendimentos > 0 ? `${appointmentsHoje.length} hoje` : 'Nenhum cadastrado'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center text-blue-brand">
              <Calendar size={20} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Ticket Médio</p>
              <p className="text-2xl font-semibold text-text-primary mt-1 font-[Outfit]">
                R$ {ticketMedio.toFixed(2)}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {totalAtendimentos > 0 ? `Baseado em ${totalAtendimentos} atendimento(s)` : 'Sem dados'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center text-blue-brand">
              <Users size={20} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Faturamento Total</p>
              <p className="text-2xl font-semibold text-text-primary mt-1 font-[Outfit]">
                R$ {appointments.reduce((a, b) => a + b.valor, 0).toFixed(2)}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Soma de todos os atendimentos</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center text-blue-brand">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="col-span-2" header={<span className="font-heading text-base font-medium">Faturamento dos últimos 6 meses</span>}>
          {dados.chartData.some(d => d.bruto > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAF4" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#8FA3BC' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#8FA3BC' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bruto" name="Faturamento Bruto" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="liquido" name="Faturamento Líquido" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-text-muted text-sm bg-bg-card-alt rounded-lg">
              <FileText size={32} className="text-text-muted mb-2" />
              <p>Nenhuma nota fiscal emitida ainda</p>
              <p className="text-xs mt-1">Emita notas fiscais no módulo "Nota Fiscal" para ver o gráfico</p>
            </div>
          )}
        </Card>

        {/* Alertas */}
        <Card header={<span className="font-heading text-base font-medium">Alertas</span>}>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-text-muted text-sm">
                <Info size={24} className="mb-2" />
                <p>Nenhum alerta no momento</p>
                <p className="text-xs mt-1">Tudo está em ordem</p>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'danger' ? 'border-danger bg-danger-pale' :
                  alert.type === 'warning' ? 'border-warning bg-warning-pale' :
                  'border-blue-brand bg-blue-pale/30'
                }`}>
                  <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{alert.desc}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Agenda do dia */}
      <Card header={<span className="font-heading text-base font-medium">Agenda do dia</span>}>
        {appointmentsHoje.length > 0 ? (
          <div className="divide-y divide-border">
            {appointmentsHoje.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-brand" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{apt.paciente_nome}</p>
                    <p className="text-xs text-text-secondary">
                      {apt.horario || '—'} · {apt.procedimento}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">R$ {apt.valor.toFixed(2)}</span>
                  <Badge variant={apt.status === 'pago' ? 'green' : apt.status === 'pendente' ? 'amber' : 'blue'}>
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-text-muted text-sm">
            <Calendar size={16} className="mr-2" />
            Nenhum atendimento hoje. Cadastre atendimentos no módulo "Atendimentos".
          </div>
        )}
      </Card>
    </div>
  )
}
