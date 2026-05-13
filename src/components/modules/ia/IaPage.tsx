import { Card } from '../../ui/Card'
import { PaywallGate } from '../../trial/PaywallGate'
import { Brain, MessageSquare, FileText, Microscope } from 'lucide-react'

export function IaPage() {
  return (
    <PaywallGate feature="clinic" description="O Charcot é o assistente de IA do Medvante. Analise prontuários, sugira diagnósticos diferenciais e otimize sua prática clínica.">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-deep to-blue-mid rounded-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Brain size={28} className="text-blue-brand" />
            <h2 className="font-heading text-2xl font-medium">Charcot — IA Clínica</h2>
          </div>
          <p className="text-text-on-dark2 max-w-xl text-sm">
            Seu assistente inteligente para análise de prontuários, sugestão de diagnósticos e otimização de procedimentos.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, label: 'Análise de prontuários', desc: 'Resuma e extraia insights de prontuários em segundos' },
            { icon: Microscope, label: 'Sugestão diagnóstica', desc: 'Receba sugestões baseadas em evidências' },
            { icon: FileText, label: 'Relatórios inteligentes', desc: 'Gere relatórios completos automaticamente' },
          ].map((item) => (
            <Card key={item.label}>
              <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center mb-3">
                <item.icon size={20} className="text-blue-brand" />
              </div>
              <h3 className="font-heading text-base font-medium text-text-primary mb-1">{item.label}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </Card>
          ))}
        </div>

        <Card header={<span className="font-heading text-base font-medium">Conversas recentes</span>}>
          <div className="space-y-2">
            {['Análise de caso: Paciente com hipertensão refratária', 'Resumo de prontuário: 15 consultas', 'Sugestão de conduta para diabetes tipo 2'].map((conv) => (
              <div key={conv} className="p-3 rounded-lg bg-bg-card-alt hover:bg-blue-pale transition-colors cursor-pointer">
                <p className="text-sm text-text-primary">{conv}</p>
                <p className="text-xs text-text-muted mt-0.5">Há 2 horas</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PaywallGate>
  )
}
