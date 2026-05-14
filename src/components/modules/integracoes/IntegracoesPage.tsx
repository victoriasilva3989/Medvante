import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { useBankStore } from '../../../store/bankStore'
import {
  Building2, Plus, Link, RefreshCw, Upload,
  FileDown, Shield, ShieldCheck, FlaskConical,
  ArrowUpDown, Eye, EyeOff, CheckCircle, Clock,
  Landmark, Trash2
} from 'lucide-react'

const mockCertificates = [
  { id: 'c1', nome: 'Certificado A1 - Dr. Carlos', emissor: 'Soluti', validade: '15/08/2026', diasRestantes: 95, tipo: 'A1', ambiente: 'producao', status: 'active' },
  { id: 'c2', nome: 'Certificado A3 - Clínica', emissor: 'Certisign', validade: '20/03/2027', diasRestantes: 312, tipo: 'A3', ambiente: 'homologacao', status: 'active' },
]

export function IntegracoesPage() {
  const { accounts, addAccount, removeAccount, updateStatus, updateSaldo } = useBankStore()
  const [tab, setTab] = useState('bancos')
  const [saldoVisivel, setSaldoVisivel] = useState(true)
  const [showConectarBanco, setShowConectarBanco] = useState(false)
  const [showUploadCert, setShowUploadCert] = useState(false)
  const [certUploaded, setCertUploaded] = useState<string | null>(null)

  const totalBancos = accounts.filter(a => a.status === 'connected').reduce((a, b) => a + b.saldo, 0)
  const connectedCount = accounts.filter(a => a.status === 'connected').length

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { key: 'bancos', label: 'Bancos (Open Finance)', icon: <Landmark size={16} /> },
          { key: 'convenios', label: 'Convênios', icon: <Building2 size={16} /> },
          { key: 'nfce', label: 'Certificados NF-e', icon: <ShieldCheck size={16} /> },
          { key: 'marketplace', label: 'Marketplace', icon: <ArrowUpDown size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'bancos' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-text-secondary">Saldo total consolidado</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {saldoVisivel ? `R$ ${totalBancos.toFixed(2)}` : '••••••'}
              </p>
              <button onClick={() => setSaldoVisivel(!saldoVisivel)} className="text-xs text-blue-brand mt-1 flex items-center gap-1 cursor-pointer">
                {saldoVisivel ? <EyeOff size={12} /> : <Eye size={12} />}
                {saldoVisivel ? 'Ocultar' : 'Mostrar'}
              </button>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Contas conectadas</p>
              <p className="text-2xl font-semibold text-success mt-1">{connectedCount}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Pendentes</p>
              <p className="text-2xl font-semibold text-warning mt-1">{accounts.filter(a => a.status === 'pending').length}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Total de contas</p>
              <p className="text-xl font-semibold text-text-primary mt-1">{accounts.length}</p>
            </Card>
          </div>

          {/* Open Finance Banner */}
          <Card className="bg-gradient-to-r from-blue-deep to-blue-mid text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-medium">Open Finance</h3>
                <p className="text-text-on-dark2 text-sm mt-1 max-w-xl">
                  Conecte suas contas bancárias via Open Finance e acompanhe o saldo em tempo real diretamente no Medvante.
                  Sua senha bancária nunca é compartilhada — tudo via token seguro.
                </p>
                <div className="flex gap-4 mt-3 text-xs text-text-on-dark2/80">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> Token seguro</span>
                  <span className="flex items-center gap-1"><RefreshCw size={12} /> Saldo atualizado</span>
                  <span className="flex items-center gap-1"><FileDown size={12} /> Extrato automático</span>
                </div>
              </div>
              <Button variant="primary" className="!bg-white !text-blue-deep hover:!bg-blue-pale flex-shrink-0" onClick={() => setShowConectarBanco(true)}>
                <Plus size={16} /> Conectar banco
              </Button>
            </div>
          </Card>

          {/* Bank Accounts */}
          <div className="grid grid-cols-2 gap-4">
            {accounts.map((bank) => (
              <Card key={bank.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bank.status === 'connected' ? 'bg-success-pale' : bank.status === 'pending' ? 'bg-warning-pale' : 'bg-danger-pale'}`}>
                      <Landmark size={20} className={bank.status === 'connected' ? 'text-success' : bank.status === 'pending' ? 'text-warning' : 'text-danger'} />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{bank.nome}</h3>
                      <p className="text-xs text-text-secondary">Ag {bank.agencia} · C/C {bank.conta}</p>
                      <p className="text-xs text-text-muted">{bank.tipo}</p>
                    </div>
                  </div>
                  <Badge variant={bank.status === 'connected' ? 'green' : bank.status === 'pending' ? 'amber' : 'red'}>
                    {bank.status === 'connected' ? 'Conectado' : bank.status === 'pending' ? 'Pendente' : 'Desconectado'}
                  </Badge>
                </div>

                {bank.status === 'connected' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-text-muted">Saldo disponível</p>
                        <p className="text-xl font-semibold text-text-primary">
                          {saldoVisivel ? `R$ ${bank.saldo.toFixed(2)}` : '••••••'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Atualizado em</p>
                        <p className="text-xs text-text-secondary">{bank.ultimaAtualizacao}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => updateSaldo(bank.id, bank.saldo + (Math.random() * 1000 - 500))}>
                        <RefreshCw size={12} /> Atualizar saldo
                      </Button>
                      <Button variant="ghost" size="sm" className="!text-danger" onClick={() => { if (confirm('Desconectar esta conta?')) removeAccount(bank.id) }}>
                        <Trash2 size={12} /> Remover
                      </Button>
                    </div>
                  </div>
                )}

                {bank.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-warning">
                      <Clock size={14} />
                      <span className="text-xs">Aguardando autorização</span>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => updateStatus(bank.id, 'connected')}>
                      Ativar conexão
                    </Button>
                  </div>
                )}

                {bank.status === 'disconnected' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="primary" size="sm" onClick={() => updateStatus(bank.id, 'connected')}>
                      <Link size={12} /> Reconectar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Modal open={showConectarBanco} onClose={() => setShowConectarBanco(false)} title="Conectar banco">
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Selecione seu banco para adicionar ao Medvante:</p>
              <div className="grid grid-cols-2 gap-3">
                {['Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'NuBank', 'Caixa', 'Inter', 'Sicredi'].map((banco) => (
                  <button key={banco} onClick={() => {
                    addAccount({
                      id: 'bank-' + Date.now(),
                      nome: banco,
                      agencia: String(1000 + Math.floor(Math.random() * 9000)),
                      conta: String(Math.floor(Math.random() * 99999)),
                      saldo: Math.random() * 50000,
                      tipo: Math.random() > 0.5 ? 'Conta Corrente' : 'Conta Poupança',
                      status: 'connected',
                      ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
                    })
                    setShowConectarBanco(false)
                  }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-blue-brand hover:bg-blue-pale/30 transition-all cursor-pointer w-full">
                    <Landmark size={18} className="text-blue-mid" />
                    <span className="text-sm font-medium text-text-primary">{banco}</span>
                  </button>
                ))}
              </div>
              <div className="bg-blue-pale rounded-lg p-3 text-xs text-blue-mid flex items-start gap-2">
                <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
                <span>Conta adicionada localmente. Em produção, a conexão seria via Open Finance com token seguro.</span>
              </div>
            </div>
          </Modal>
        </>
      )}

      {tab === 'convenios' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Integrações com convênios para repasse de guias, faturamento e status de glosas.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'UNIMED', status: 'connected', desc: 'Repasse de guias e faturamento automático' },
              { name: 'SulAmérica', status: 'connected', desc: 'Repasse de guias e faturamento' },
              { name: 'Amil', status: 'disconnected', desc: 'Autenticação necessária' },
              { name: 'Bradesco Saúde', status: 'connected', desc: 'Repasse de guias e faturamento' },
              { name: 'NotreDame', status: 'disconnected', desc: 'Integração em andamento' },
              { name: 'Hapvida', status: 'coming-soon', desc: 'Em breve' },
            ].map((int) => (
              <Card key={int.name}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-pale flex items-center justify-center">
                      <Building2 size={20} className="text-blue-mid" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{int.name}</h3>
                      <p className="text-xs text-text-secondary">{int.desc}</p>
                    </div>
                  </div>
                  <Badge variant={int.status === 'connected' ? 'green' : int.status === 'disconnected' ? 'red' : 'amber'}>
                    {int.status === 'connected' ? 'Conectado' : int.status === 'disconnected' ? 'Desconectado' : 'Em breve'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'nfce' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card><p className="text-sm text-text-secondary">Certificados ativos</p><p className="text-2xl font-semibold text-success mt-1">{mockCertificates.filter(c => c.status === 'active').length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Vencendo em 30 dias</p><p className="text-2xl font-semibold text-danger mt-1">{mockCertificates.filter(c => c.diasRestantes <= 30).length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Ambiente produção</p><p className="text-2xl font-semibold text-blue-brand mt-1">{mockCertificates.filter(c => c.ambiente === 'producao').length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Homologação</p><p className="text-2xl font-semibold text-warning mt-1">{mockCertificates.filter(c => c.ambiente === 'homologacao').length}</p></Card>
          </div>

          <Card header={<span className="font-heading text-base font-medium">Gerenciar certificados digitais</span>}>
            <div className="border-2 border-dashed border-border-strong rounded-xl p-8 text-center hover:border-blue-brand transition-colors cursor-pointer" onClick={() => setShowUploadCert(true)}>
              <Upload size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-primary font-medium">Clique para simular upload de certificado</p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="blue">.pfx</Badge>
                <Badge variant="blue">.p12</Badge>
                <Badge variant="gold">A1</Badge>
                <Badge variant="gold">A3</Badge>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {mockCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cert.diasRestantes <= 30 ? 'bg-danger-pale' : 'bg-success-pale'}`}>
                      <Shield size={20} className={cert.diasRestantes <= 30 ? 'text-danger' : 'text-success'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary text-sm">{cert.nome}</h3>
                        <Badge variant={cert.ambiente === 'producao' ? 'blue' : 'amber'}>{cert.ambiente}</Badge>
                        <Badge variant="gold">{cert.tipo}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{cert.emissor} · Válido até {cert.validade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs font-medium ${cert.diasRestantes <= 30 ? 'text-danger' : 'text-success'}`}>
                        {cert.diasRestantes} dias restantes
                      </p>
                    </div>
                    <Badge variant="green"><CheckCircle size={12} /> Ativo</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-pale border border-blue-muted">
              <div className="flex items-start gap-3">
                <FlaskConical size={18} className="text-blue-mid mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-mid">Ambiente de homologação disponível</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Antes de emitir em produção, utilize o ambiente de homologação da SEFAZ para testar suas notas fiscais sem valor fiscal.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Modal open={showUploadCert} onClose={() => setShowUploadCert(false)} title="Upload de certificado digital">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border-strong rounded-xl p-6 text-center">
                {certUploaded ? (
                  <div className="text-success">
                    <CheckCircle size={32} className="mx-auto mb-2" />
                    <p className="font-medium">{certUploaded}</p>
                    <button onClick={() => setCertUploaded(null)} className="text-xs text-text-muted mt-1 cursor-pointer hover:text-danger">Remover</button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto text-text-muted mb-2" />
                    <p className="text-sm text-text-primary font-medium">Selecione o arquivo do certificado</p>
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => setCertUploaded('certificado_homologacao.pfx')}>
                      Simular seleção
                    </Button>
                  </>
                )}
              </div>
              <Button className="w-full" disabled={!certUploaded}>Salvar certificado</Button>
            </div>
          </Modal>
        </>
      )}

      {tab === 'marketplace' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Conecte-se a marketplaces e plataformas para ampliar sua captação de pacientes.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Doctoralia', status: 'coming-soon', desc: 'Agenda online e reputação' },
              { name: 'Google Meu Negócio', status: 'coming-soon', desc: 'Sincronizar avaliações' },
              { name: 'Instagram/Facebook', status: 'coming-soon', desc: 'Agendamento via redes sociais' },
              { name: 'Tasy (Philips)', status: 'coming-soon', desc: 'Integração hospitalar' },
            ].map((item) => (
              <Card key={item.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-card-alt flex items-center justify-center opacity-50">
                      <Building2 size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{item.name}</h3>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                  <Badge variant="amber">Em breve</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}