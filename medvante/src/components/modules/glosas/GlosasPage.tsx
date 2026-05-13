import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { mockGlosas } from '../../../data/glosas'

export function GlosasPage() {
  const totalGlosado = mockGlosas.reduce((a, b) => a + b.valorGlosado, 0)
  const totalOriginal = mockGlosas.reduce((a, b) => a + b.valorOriginal, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-text-secondary">Total glosado</p>
          <p className="text-xl font-semibold text-danger mt-1">R$ {totalGlosado.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Taxa de glosa</p>
          <p className="text-xl font-semibold text-text-primary mt-1">{((totalGlosado / totalOriginal) * 100).toFixed(1)}%</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Glosas abertas</p>
          <p className="text-xl font-semibold text-warning mt-1">{mockGlosas.filter(g => g.status === 'aberta').length}</p>
        </Card>
      </div>

      <Card header={<span className="font-heading text-base font-medium">Glosas</span>}>
        <Table headers={['Paciente', 'Convênio', 'Procedimento', 'Valor Original', 'Valor Glosado', 'Motivo', 'Status', 'Prazo']}>
          {mockGlosas.map((g) => (
            <tr key={g.id} className="hover:bg-blue-pale transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-text-primary">{g.paciente}</td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.convenio}</td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.procedimento}</td>
              <td className="px-4 py-3 text-sm text-text-primary">R$ {g.valorOriginal.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-medium text-danger">R$ {g.valorGlosado.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-text-secondary max-w-[200px] truncate">{g.motivo}</td>
              <td className="px-4 py-3">
                <Badge variant={g.status === 'aberta' ? 'amber' : g.status === 'contestada' ? 'blue' : g.status === 'reembolsada' ? 'green' : 'red'}>
                  {g.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-text-secondary">{g.prazoRecurso || '-'}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
