import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { PaywallGate } from '../../trial/PaywallGate'
import { Plus } from 'lucide-react'

const mockBudgets = [
  { id: '1', paciente: 'Maria da Silva', procedimentos: 'Consulta + Exame', valorTotal: 580, data: '15/03/2024', status: 'aprovado' },
  { id: '2', paciente: 'Roberto Lima', procedimentos: 'Cirurgia', valorTotal: 3500, data: '12/03/2024', status: 'orçamento' },
  { id: '3', paciente: 'Ana Costa', procedimentos: 'Tratamento estético', valorTotal: 2800, data: '10/03/2024', status: 'convertido' },
  { id: '4', paciente: 'João Santos', procedimentos: 'Exames laboratoriais', valorTotal: 890, data: '08/03/2024', status: 'recusado' },
]

export function OrcamentosPage() {
  return (
    <PaywallGate feature="pro" description="Crie orçamentos profissionais, acompanhe aprovações e converta em atendimento com um clique.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="primary"><Plus size={16} /> Novo orçamento</Button>
        </div>
        <Card header={<span className="font-heading text-base font-medium">Orçamentos</span>}>
          <Table headers={['Paciente', 'Procedimentos', 'Valor Total', 'Data', 'Status']}>
            {mockBudgets.map((b) => (
              <tr key={b.id} className="hover:bg-blue-pale transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.paciente}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{b.procedimentos}</td>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {b.valorTotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{b.data}</td>
                <td className="px-4 py-3">
                  <Badge variant={b.status === 'aprovado' ? 'green' : b.status === 'orçamento' ? 'blue' : b.status === 'convertido' ? 'gold' : 'red'}>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </PaywallGate>
  )
}
