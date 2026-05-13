import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Shield, Lock, Fingerprint, FileText, Server, Users } from 'lucide-react'

const securityItems = [
  { icon: Lock, title: 'Criptografia SSL 256-bit', desc: 'Todos os dados trafegam com criptografia de ponta a ponta, padrão bancário.' },
  { icon: Fingerprint, title: 'Autenticação multifator', desc: 'Camada extra de segurança com verificação em dois fatores.' },
  { icon: Server, title: 'AWS Data Center', desc: 'Infraestrutura hosteada na AWS com certificações SOC 2 e ISO 27001.' },
  { icon: FileText, title: 'LGPD Compliance', desc: 'Total conformidade com a Lei Geral de Proteção de Dados.' },
  { icon: Users, title: 'Controle de acesso granular', desc: 'Permissões por módulo e por usuário, com auditoria de acesso.' },
  { icon: Shield, title: 'Backup automático diário', desc: 'Backups criptografados com retention de 90 dias.' },
]

export function SegurancaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="text-center py-8">
        <Shield size={48} className="mx-auto text-blue-brand mb-4" />
        <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">Proteção nível bancário</h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          O Medvante segue os mais rigorosos padrões de segurança e privacidade para proteger seus dados e de seus pacientes.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {securityItems.map((item) => (
          <Card key={item.title}>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-pale flex items-center justify-center flex-shrink-0">
                <item.icon size={24} className="text-blue-mid" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary text-sm">{item.title}</h3>
                <p className="text-xs text-text-secondary mt-1">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card header={<span className="font-heading text-base font-medium">Certificações e selos</span>}>
        <div className="flex flex-wrap gap-4">
          {['LGPD', 'AWS', 'SSL 256-bit', 'SOC 2', 'ISO 27001', 'HIPAA'].map((selo) => (
            <Badge key={selo} variant="gold" className="!px-4 !py-2 !text-sm">{selo}</Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}
