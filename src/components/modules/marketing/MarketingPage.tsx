import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { PaywallGate } from '../../trial/PaywallGate'
import { Megaphone, Star, Send } from 'lucide-react'

const mockCampanhas = [
  { id: '1', nome: 'Campanha de Retorno', tipo: 'whatsapp', disparos: 340, abertos: 280, respondidos: 95, taxaConversao: 27.9, data: '15/03/2024', status: 'enviada' },
  { id: '2', nome: 'Lembretes Consulta', tipo: 'sms', disparos: 180, abertos: 165, respondidos: 42, taxaConversao: 23.3, data: '12/03/2024', status: 'concluida' },
  { id: '3', nome: 'Novos Procedimentos', tipo: 'email', disparos: 520, abertos: 310, respondidos: 78, taxaConversao: 15.0, data: '10/03/2024', status: 'enviada' },
]

export function MarketingPage() {
  return (
    <PaywallGate feature="pro" description="Dispare campanhas de marketing, colete NPS dos pacientes e aumente suas taxas de retorno.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="primary"><Send size={16} /> Nova campanha</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Megaphone size={20} className="text-blue-brand" /></div>
              <div><p className="text-sm text-text-secondary">Campanhas enviadas</p><p className="text-xl font-semibold text-text-primary mt-1">12</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><Star size={20} className="text-success" /></div>
              <div><p className="text-sm text-text-secondary">NPS médio</p><p className="text-xl font-semibold text-text-primary mt-1">78</p></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-pale flex items-center justify-center"><Send size={20} className="text-gold" /></div>
              <div><p className="text-sm text-text-secondary">Taxa de conversão</p><p className="text-xl font-semibold text-text-primary mt-1">22%</p></div>
            </div>
          </Card>
        </div>

        <Card header={<span className="font-heading text-base font-medium">Campanhas</span>}>
          <table className="w-full border-collapse">
            <thead><tr className="bg-bg-card-alt">
              {['Nome', 'Tipo', 'Disparos', 'Abertos', 'Respondidos', 'Conversão', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {mockCampanhas.map(c => (
                <tr key={c.id} className="hover:bg-blue-pale transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{c.nome}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{c.tipo}</Badge></td>
                  <td className="px-4 py-3 text-sm text-text-primary">{c.disparos}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{c.abertos}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{c.respondidos}</td>
                  <td className="px-4 py-3 text-sm font-medium text-success">{c.taxaConversao}%</td>
                  <td className="px-4 py-3"><Badge variant={c.status === 'concluida' ? 'green' : 'blue'}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </PaywallGate>
  )
}
