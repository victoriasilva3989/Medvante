import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { PaywallGate } from '../../trial/PaywallGate'
import { DoorOpen, Clock, Users } from 'lucide-react'

export function RecepcaoPage() {
  return (
    <PaywallGate feature="clinic" description="Gerencie a recepção da clínica: check-in de pacientes, fila de espera e triagem em tempo real.">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center"><Users size={20} className="text-blue-brand" /></div>
            <div><p className="text-sm text-text-secondary">Pacientes hoje</p><p className="text-xl font-semibold text-text-primary mt-1">18</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-pale flex items-center justify-center"><Clock size={20} className="text-warning" /></div>
            <div><p className="text-sm text-text-secondary">Em espera</p><p className="text-xl font-semibold text-text-primary mt-1">4</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-pale flex items-center justify-center"><DoorOpen size={20} className="text-success" /></div>
            <div><p className="text-sm text-text-secondary">Em consulta</p><p className="text-xl font-semibold text-text-primary mt-1">3</p></div>
          </div>
        </Card>
      </div>

      <Card header={<span className="font-heading text-base font-medium">Fila de espera</span>}>
        <div className="divide-y divide-border">
          {['Ana Oliveira', 'Carlos Santos', 'Marina Rocha', 'Pedro Costa'].map((nome, i) => (
            <div key={nome} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-card-alt flex items-center justify-center text-xs font-medium text-text-primary">{nome.charAt(0)}</div>
                <div><p className="text-sm font-medium text-text-primary">{nome}</p><p className="text-xs text-text-secondary">Chegou há {i + 5} min</p></div>
              </div>
              <Badge variant={i < 2 ? 'amber' : 'blue'}>Aguardando</Badge>
            </div>
          ))}
        </div>
      </Card>
    </PaywallGate>
  )
}
