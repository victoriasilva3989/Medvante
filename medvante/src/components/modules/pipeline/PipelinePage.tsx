import { Badge } from '../../ui/Badge'
import { mockPipeline } from '../../../data/pipeline'
import { DollarSign, Phone, MessageCircle, Handshake, CheckCircle } from 'lucide-react'

const stageConfig: Record<string, { title: string; icon: typeof DollarSign; color: string }> = {
  'nao-contatado': { title: 'Não contatado', icon: Phone, color: 'text-text-muted' },
  'contatado': { title: 'Contatado', icon: MessageCircle, color: 'text-blue-brand' },
  'negociacao': { title: 'Negociação', icon: Handshake, color: 'text-warning' },
  'acordo': { title: 'Acordo', icon: DollarSign, color: 'text-gold' },
  'recuperado': { title: 'Recuperado', icon: CheckCircle, color: 'text-success' },
}

const stages = ['nao-contatado', 'contatado', 'negociacao', 'acordo', 'recuperado']

export function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)] overflow-auto">
        {stages.map((stage) => {
          const config = stageConfig[stage]
          const cards = mockPipeline.filter((c) => c.etapa === stage)
          const totalValue = cards.reduce((a, b) => a + b.valor, 0)
          const Icon = config.icon

          return (
            <div key={stage} className="bg-bg-app rounded-xl border border-border">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={config.color} />
                  <h3 className="text-sm font-medium text-text-primary">{config.title}</h3>
                  <Badge variant="blue">{cards.length}</Badge>
                </div>
                <p className="text-xs font-semibold text-text-primary">
                  R$ {totalValue.toFixed(2)}
                </p>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                {cards.map((card) => (
                  <div key={card.id} className="bg-bg-card rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="text-sm font-medium text-text-primary">{card.paciente}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{card.procedimento}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-text-primary">R$ {card.valor.toFixed(2)}</span>
                      <Badge variant={card.diasAtraso > 30 ? 'red' : card.diasAtraso > 15 ? 'amber' : 'blue'}>
                        {card.diasAtraso}d
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
