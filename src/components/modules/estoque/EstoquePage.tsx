import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { PaywallGate } from '../../trial/PaywallGate'
import { Plus, AlertTriangle } from 'lucide-react'

const mockStock = [
  { id: '1', nome: 'Luvas descartáveis (cx)', categoria: 'Insumos', quantidade: 45, quantidadeMinima: 20, unidade: 'cx', valorUnitario: 32.50 },
  { id: '2', nome: 'Seringas 5ml (cx)', categoria: 'Insumos', quantidade: 12, quantidadeMinima: 15, unidade: 'cx', valorUnitario: 18.90 },
  { id: '3', nome: 'Álcool gel 1L', categoria: 'Higiene', quantidade: 8, quantidadeMinima: 10, unidade: 'un', valorUnitario: 15.00 },
  { id: '4', nome: 'Ataduras (pct)', categoria: 'Curativos', quantidade: 30, quantidadeMinima: 10, unidade: 'pct', valorUnitario: 8.50 },
  { id: '5', nome: 'Medicamentos - Dipirona (cx)', categoria: 'Medicamentos', quantidade: 3, quantidadeMinima: 5, unidade: 'cx', valorUnitario: 45.00 },
]

export function EstoquePage() {
  return (
    <PaywallGate feature="pro" description="Gerencie seu estoque com controle de validade, fornecedores e alertas de reposição automática.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="primary"><Plus size={16} /> Novo item</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><p className="text-sm text-text-secondary">Itens em estoque</p><p className="text-2xl font-semibold text-text-primary mt-1">{mockStock.length}</p></Card>
          <Card><p className="text-sm text-text-secondary">Valor total</p><p className="text-2xl font-semibold text-text-primary mt-1">R$ 1.234,50</p></Card>
          <Card><p className="text-sm text-text-secondary">Itens abaixo do mínimo</p><p className="text-2xl font-semibold text-danger mt-1">{mockStock.filter(i => i.quantidade < i.quantidadeMinima).length}</p></Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Estoque</span>}>
          <Table headers={['Item', 'Categoria', 'Qtd', 'Mínimo', 'Unidade', 'Valor unit.', 'Status']}>
            {mockStock.map((item) => (
              <tr key={item.id} className="hover:bg-blue-pale transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.nome}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.categoria}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{item.quantidade}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.quantidadeMinima}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.unidade}</td>
                <td className="px-4 py-3 text-sm text-text-primary">R$ {item.valorUnitario.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {item.quantidade < item.quantidadeMinima ? (
                    <Badge variant="red"><AlertTriangle size={12} /> Repor</Badge>
                  ) : (
                    <Badge variant="green">OK</Badge>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </PaywallGate>
  )
}
