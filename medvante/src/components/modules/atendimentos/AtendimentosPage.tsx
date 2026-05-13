import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Tabs } from '../../ui/Tabs'
import { mockAppointments } from '../../../data/appointments'
import { Calendar, Clock, List } from 'lucide-react'

export function AtendimentosPage() {
  const [tab, setTab] = useState('lista')

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { key: 'lista', label: 'Lista', icon: <List size={16} /> },
          { key: 'agenda', label: 'Agenda', icon: <Calendar size={16} /> },
          { key: 'produtividade', label: 'Produtividade', icon: <Clock size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'lista' && (
        <Card header={<span className="font-heading text-base font-medium">Atendimentos</span>}>
          <Table headers={['Data', 'Paciente', 'Procedimento', 'Tipo', 'Valor', 'Status']}>
            {mockAppointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-blue-pale transition-colors">
                <td className="px-4 py-3 text-sm text-text-primary">{apt.data}</td>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{apt.paciente_nome}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{apt.procedimento}</td>
                <td className="px-4 py-3">
                  <Badge variant={apt.tipo === 'particular' ? 'green' : apt.tipo === 'convenio' ? 'blue' : 'gold'}>
                    {apt.tipo}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {apt.valor.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Badge variant={apt.status === 'pago' ? 'green' : apt.status === 'pendente' ? 'amber' : 'blue'}>
                    {apt.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'agenda' && (
        <div className="grid grid-cols-7 gap-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="bg-bg-card rounded-xl border border-border p-3 min-h-[300px]">
              <p className="text-xs font-medium text-text-muted text-center mb-2">{day}</p>
              <div className="space-y-1">
                {mockAppointments.filter((_, i) => i < 3).map((apt) => (
                  <div key={apt.id} className={`text-[10px] p-1.5 rounded border-l-2 ${
                    apt.tipo === 'convenio' ? 'border-blue-brand' : apt.tipo === 'particular' ? 'border-success' : 'border-gold'
                  } bg-bg-card-alt`}>
                    <p className="font-medium text-text-primary truncate">{apt.paciente_nome}</p>
                    <p className="text-text-muted truncate">{apt.procedimento}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'produtividade' && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-text-secondary">Total de atendimentos (mês)</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">187</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Taxa de conversão</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">72%</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Tempo médio por consulta</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">32 min</p>
          </Card>
        </div>
      )}
    </div>
  )
}
