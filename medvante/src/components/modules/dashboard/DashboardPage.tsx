import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Wallet } from 'lucide-react'
import { mockAppointments } from '../../../data/appointments'

const stats = [
  { label: 'Faturamento do mês', value: 'R$ 48.250', delta: 12.5, icon: DollarSign, color: 'text-success' },
  { label: 'Total de atendimentos', value: '187', delta: 8.2, icon: Calendar, color: 'text-blue-brand' },
  { label: 'Ticket médio', value: 'R$ 258', delta: -3.1, icon: Users, color: 'text-warning' },
  { label: 'Saldo disponível', value: 'R$ 32.400', delta: 5.7, icon: Wallet, color: 'text-success' },
]

export function DashboardPage() {
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
              </div>
              <div className={`w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.delta >= 0 ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-danger" />}
              <span className={`text-xs font-medium ${stat.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                {Math.abs(stat.delta)}% vs mês anterior
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart placeholder */}
        <Card className="col-span-2" header={<span className="font-heading text-base font-medium">Faturamento dos últimos 6 meses</span>}>
          <div className="h-64 flex items-center justify-center text-text-muted text-sm bg-bg-card-alt rounded-lg">
            Gráfico de faturamento (Recharts)
          </div>
        </Card>

        {/* Alerts */}
        <Card header={<span className="font-heading text-base font-medium">Alertas</span>}>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border-l-4 border-danger bg-bg-card-alt">
              <p className="text-xs font-medium text-text-primary">Glosa urgente</p>
              <p className="text-xs text-text-secondary mt-0.5">R$ 1.500 em risco — prazo de recurso expira em 3 dias</p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-warning bg-bg-card-alt">
              <p className="text-xs font-medium text-text-primary">Contas a pagar</p>
              <p className="text-xs text-text-secondary mt-0.5">2 boletos vencem nos próximos 5 dias</p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-blue-brand bg-bg-card-alt">
              <p className="text-xs font-medium text-text-primary">Importação disponível</p>
              <p className="text-xs text-text-secondary mt-0.5">Você ainda não importou seu histórico de atendimentos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agenda */}
      <Card header={<span className="font-heading text-base font-medium">Agenda do dia</span>}>
        <div className="divide-y divide-border">
          {mockAppointments.slice(0, 5).map((apt) => (
            <div key={apt.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-brand" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{apt.paciente_nome}</p>
                  <p className="text-xs text-text-secondary">{apt.procedimento} · {apt.data}</p>
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
      </Card>
    </div>
  )
}
