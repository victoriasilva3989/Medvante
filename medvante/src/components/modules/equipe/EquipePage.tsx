import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { PaywallGate } from '../../trial/PaywallGate'
import { Users, UserPlus } from 'lucide-react'

const mockTeam = [
  { id: '1', nome: 'Maria Silva', cargo: 'Secretária', email: 'maria@clinicamendes.com.br', dataContratacao: '10/01/2023', salario: 2500, ativo: true },
  { id: '2', nome: 'João Costa', cargo: 'Enfermeiro', email: 'joao@clinicamendes.com.br', dataContratacao: '05/03/2023', salario: 3200, ativo: true },
  { id: '3', nome: 'Lucia Santos', cargo: 'Recepcionista', email: 'lucia@clinicamendes.com.br', dataContratacao: '20/06/2023', salario: 1800, comissao: 2, ativo: true },
]

export function EquipePage() {
  return (
    <PaywallGate feature="clinic" description="Gerencie sua equipe, cargos, salários, comissões e comunicação interna com chat integrado.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="primary"><UserPlus size={16} /> Novo membro</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card><div className="flex items-center gap-3"><Users size={20} className="text-blue-brand" /><div><p className="text-sm text-text-secondary">Total</p><p className="text-xl font-semibold text-text-primary mt-1">{mockTeam.length}</p></div></div></Card>
          <Card><p className="text-sm text-text-secondary">Folha de pagamento</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 7.500</p></Card>
          <Card><p className="text-sm text-text-secondary">Custo total com comissões</p><p className="text-xl font-semibold text-text-primary mt-1">R$ 520</p></Card>
        </div>
        <Card header={<span className="font-heading text-base font-medium">Equipe</span>}>
          <Table headers={['Nome', 'Cargo', 'Email', 'Desde', 'Salário', 'Comissão', 'Status']}>
            {mockTeam.map((m) => (
              <tr key={m.id} className="hover:bg-blue-pale transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{m.nome}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.cargo}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.email}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.dataContratacao}</td>
                <td className="px-4 py-3 text-sm text-text-primary">R$ {m.salario.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.comissao ? `${m.comissao}%` : '-'}</td>
                <td className="px-4 py-3"><Badge variant={m.ativo ? 'green' : 'red'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </PaywallGate>
  )
}
