import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import {
  Building2, Plus, Link, Unlink, RefreshCw, Upload,
  FileDown, Shield, ShieldCheck, FlaskConical,
  ArrowUpDown, Eye, EyeOff, CheckCircle, Clock,
  Landmark
} from 'lucide-react'

// ── Mock Banks (Open Finance) ──
const mockBanks = [
  { id: 'b1', nome: 'Banco do Brasil', agencia: '1234-5', conta: '45.678-9', saldo: 32450.00, tipo: 'Conta Corrente', status: 'connected', ultimaAtualizacao: '12/05/2026 14:30' },
  { id: 'b2', nome: 'NuBank', agencia: '0001', conta: '987654321', saldo: 12890.50, tipo: 'Conta Corrente', status: 'connected', ultimaAtualizacao: '12/05/2026 14:28' },
  { id: 'b3', nome: 'Itaú', agencia: '5678', conta: '12345-6', saldo: 5670.80, tipo: 'Conta Poupança', status: 'disconnected', ultimaAtualizacao: '10/05/2026 09:00' },
  { id: 'b4', nome: 'Caixa Econômica', agencia: '0012', conta: '678.901-2', saldo: 0, tipo: 'Conta Corrente', status: 'pending', ultimaAtualizacao: '-' },
]

// ── Mock NF-e Certificates ──
const mockCertificates = [
  { id: 'c1', nome: 'Certificado A1 - Dr. Carlos', emissor: 'Soluti', validade: '15/08/2026', diasRestantes: 95, tipo: 'A1', ambiente: 'producao', status: 'active' },
  { id: 'c2', nome: 'Certificado A3 - Clínica', emissor: 'Certisign', validade: '20/03/2027', diasRestantes: 312, tipo: 'A3', ambiente: 'homologacao', status: 'active' },
]

export function IntegracoesPage() {
  const [tab, setTab] = useState('bancos')
  const [saldoVisivel, setSaldoVisivel] = useState(true)
  const [showConectarBanco, setShowConectarBanco] = useState(false)
  const [showUploadCert, setShowUploadCert] = useState(false)
  const [certUploaded, setCertUploaded] = useState<string | null>(null)

  const totalBancos = mockBanks.reduce((a, b) => a + b.saldo, 0)

  return (
    <div className="space-y-6">
      {/* Tabs */}
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

      {/* ────────── TAB 1: BANCOS / OPEN FINANCE ────────── */}
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
              <p className="text-2xl font-semibold text-success mt-1">{mockBanks.filter(b => b.status === 'connected').length}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Pendentes</p>
              <p className="text-2xl font-semibold text-warning mt-1">{mockBanks.filter(b => b.status === 'pending').length}</p>
            </Card>
            <Card>
              <p className="text-sm text-text-secondary">Última atualização</p>
              <p className="text-sm font-medium text-text-primary mt-1">12/05/2026 14:30</p>
              <button className="text-xs text-blue-brand mt-1 flex items-center gap-1 cursor-pointer">
                <RefreshCw size={12} /> Atualizar
              </button>
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
                  <span className="flex items-center gap-1"><RefreshCw size={12} /> Saldo atualizado a cada 5min</span>
                  <span className="flex items-center gap-1"><FileDown size={12} /> Extrato automático</span>
                </div>
              </div>
              <Button variant="primary" className="!bg-white !text-blue-deep hover:!bg-blue-pale flex-shrink-0" onClick={() => setShowConectarBanco(true)}>
                <Plus size={16} /> Conectar banco
              </Button>
            </div>
          </Card>

          {/* Bank Cards */}
          <div className="grid grid-cols-2 gap-4">
            {mockBanks.map((bank) => (
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
                      <Button variant="ghost" size="sm"><RefreshCw size={12} /> Sincronizar</Button>
                      <Button variant="ghost" size="sm"><FileDown size={12} /> Extrato</Button>
                      <Button variant="ghost" size="sm" className="!text-danger"><Unlink size={12} /> Desconectar</Button>
                    </div>
                  </div>
                )}

                {bank.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-warning">
                      <Clock size={14} />
                      <span className="text-xs">Aguardando autorização Open Finance</span>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-2">Continuar conexão</Button>
                  </div>
                )}

                {bank.status === 'disconnected' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="primary" size="sm"><Link size={12} /> Reconectar via Open Finance</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Conectar Banco Modal */}
          <Modal open={showConectarBanco} onClose={() => setShowConectarBanco(false)} title="Conectar banco via Open Finance">
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Selecione seu banco para iniciar a conexão segura via Open Finance:</p>
              <div className="grid grid-cols-2 gap-3">
                {['Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'NuBank', 'Caixa', 'Inter', 'Sicredi'].map((banco) => (
                  <button key={banco} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-blue-brand hover:bg-blue-pale/30 transition-all cursor-pointer">
                    <Landmark size={18} className="text-blue-mid" />
                    <span className="text-sm font-medium text-text-primary">{banco}</span>
                  </button>
                ))}
              </div>
              <div className="bg-blue-pale rounded-lg p-3 text-xs text-blue-mid flex items-start gap-2">
                <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
                <span>Conexão via Open Finance — suas credenciais bancárias nunca são armazenadas no Medvante. Usamos token de acesso seguro e criptografado.</span>
              </div>
              <Button className="w-full">Autorizar conexão</Button>
            </div>
          </Modal>
        </>
      )}

      {/* ────────── TAB 2: CONVÊNIOS ────────── */}
      {tab === 'convenios' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Integrações com convênios para repasse de guias, faturamento e status de glosas.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'UNIMED', type: 'Convênio', status: 'connected', desc: 'Repasse de guias e faturamento automático' },
              { name: 'SulAmérica', type: 'Convênio', status: 'connected', desc: 'Repasse de guias e faturamento' },
              { name: 'Amil', type: 'Convênio', status: 'disconnected', desc: 'Autenticação necessária' },
              { name: 'Bradesco Saúde', type: 'Convênio', status: 'connected', desc: 'Repasse de guias e faturamento' },
              { name: 'NotreDame', type: 'Convênio', status: 'disconnected', desc: 'Integração em andamento' },
              { name: 'Hapvida', type: 'Convênio', status: 'coming-soon', desc: 'Em breve' },
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
                {int.status === 'disconnected' && (
                  <button className="flex items-center gap-1 mt-3 text-xs text-blue-brand hover:underline cursor-pointer">
                    <Link size={12} /> Conectar
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ────────── TAB 3: CERTIFICADOS NF-e ────────── */}
      {tab === 'nfce' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card><p className="text-sm text-text-secondary">Certificados ativos</p><p className="text-2xl font-semibold text-success mt-1">{mockCertificates.filter(c => c.status === 'active').length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Vencendo em 30 dias</p><p className="text-2xl font-semibold text-danger mt-1">{mockCertificates.filter(c => c.diasRestantes <= 30).length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Ambiente produção</p><p className="text-2xl font-semibold text-blue-brand mt-1">{mockCertificates.filter(c => c.ambiente === 'producao').length}</p></Card>
            <Card><p className="text-sm text-text-secondary">Homologação</p><p className="text-2xl font-semibold text-warning mt-1">{mockCertificates.filter(c => c.ambiente === 'homologacao').length}</p></Card>
          </div>

          {/* Upload Certificate Card */}
          <Card header={<span className="font-heading text-base font-medium">Gerenciar certificados digitais</span>}>
            <div className="border-2 border-dashed border-border-strong rounded-xl p-8 text-center hover:border-blue-brand transition-colors cursor-pointer" onClick={() => setShowUploadCert(true)}>
              <Upload size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-primary font-medium">Arraste seu certificado digital aqui ou clique para selecionar</p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="blue">.pfx</Badge>
                <Badge variant="blue">.p12</Badge>
                <Badge variant="gold">A1</Badge>
                <Badge variant="gold">A3</Badge>
              </div>
              <p className="text-xs text-text-muted mt-2">Formatos aceitos: PFX, P12 · Máximo 5MB</p>
            </div>

            {/* Certificates List */}
            <div className="mt-6 space-y-3">
              {mockCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cert.diasRestantes <= 30 ? 'bg-danger-pale' : 'bg-success-pale'
                    }`}>
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
                    {cert.diasRestantes <= 30 ? (
                      <Button variant="danger" size="sm">Renovar</Button>
                    ) : (
                      <Badge variant="green"><CheckCircle size={12} /> Ativo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* NF-e service info */}
            <div className="mt-6 p-4 rounded-lg bg-blue-pale border border-blue-muted">
              <div className="flex items-start gap-3">
                <FlaskConical size={18} className="text-blue-mid mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-mid">Ambiente de homologação disponível</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Antes de emitir em produção, utilize o ambiente de homologação da SEFAZ para testar suas notas fiscais sem valor fiscal.
                    <button className="text-blue-brand hover:underline ml-1 cursor-pointer">Acessar homologação →</button>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Upload Certificate Modal */}
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
                    <p className="text-xs text-text-muted mt-1">PFX ou P12</p>
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => setCertUploaded('certificado_homologacao.pfx')}>
                      Selecionar arquivo
                    </Button>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Senha do certificado</label>
                <input type="password" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" placeholder="Digite a senha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Ambiente</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-blue-pale/30">
                    <input type="radio" name="ambiente" defaultChecked className="accent-blue-brand" />
                    <span className="text-sm">Homologação (testes)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-blue-pale/30">
                    <input type="radio" name="ambiente" className="accent-blue-brand" />
                    <span className="text-sm">Produção</span>
                  </label>
                </div>
              </div>
              <Button className="w-full" disabled={!certUploaded}>Enviar certificado</Button>
            </div>
          </Modal>
        </>
      )}

      {/* ────────── TAB 4: MARKETPLACE ────────── */}
      {tab === 'marketplace' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Conecte-se a marketplaces e plataformas para ampliar sua captação de pacientes.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Doctoralia', status: 'coming-soon', desc: 'Agenda online e reputação' },
              { name: 'Google Meu Negócio', status: 'coming-soon', desc: 'Sinconizar avaliações' },
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
