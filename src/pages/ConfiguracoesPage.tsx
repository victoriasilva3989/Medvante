import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { Tabs } from '../components/ui/Tabs'
import { useAuthStore } from '../store/authStore'
import { useTrialStore } from '../store/trialStore'
import { useFaturamentoStore, type RegimeTributario } from '../store/faturamentoStore'
import { Save, User, Bell, Shield, Palette, Crown, Check, ArrowUp, Star, Sparkles, Percent, Calculator } from 'lucide-react'

const planos = [
  {
    key: 'starter' as const,
    nome: 'Starter',
    preco: 'R$ 297/mês',
    desc: 'Para médicos individuais começando a organizar as finanças',
    features: ['Financeiro completo', 'Pipeline de cobranças', 'Glosas', 'Nota Fiscal (NFS-e)', 'Importação de dados', '1 usuário', 'Suporte por email'],
    limitacoes: ['Sem estoque', 'Sem orçamentos', 'Sem marketing/NPS', 'Sem IA Charcot'],
    destaque: false,
  },
  {
    key: 'pro' as const,
    nome: 'PRO',
    preco: 'R$ 497/mês',
    desc: 'Para clínicas em crescimento com equipe reduzida',
    features: ['Tudo do Starter', 'Estoque completo', 'Orçamentos', 'Marketing e NPS', 'DMED automática', 'Comissionamento', 'Até 3 usuários', 'Suporte prioritário'],
    limitacoes: ['Sem IA Charcot', 'Sem recepção', 'Sem multi-clínica'],
    destaque: true,
  },
  {
    key: 'clinic' as const,
    nome: 'Clínica',
    preco: 'R$ 897/mês',
    desc: 'Para clínicas e grupos médicos com demanda completa',
    features: ['Tudo do PRO', 'IA Charcot', 'Recepção digital', 'Equipe e chat interno', 'Multi-clínica', 'Usuários ilimitados', 'Onboarding dedicado', 'Suporte 24h', 'API e integrações'],
    limitacoes: [],
    destaque: false,
  },
]

export function ConfiguracoesPage() {
  const [tab, setTab] = useState('geral')
  const { user } = useAuthStore()
  const { planStatus, planType, activatePlan } = useTrialStore()

  const planoAtual = planos.find(p => p.key === planType)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs
        tabs={[
          { key: 'geral', label: 'Geral', icon: <User size={16} /> },
          { key: 'planos', label: 'Planos', icon: <Crown size={16} /> },
          { key: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
          { key: 'seguranca', label: 'Segurança', icon: <Shield size={16} /> },
          { key: 'tributacao', label: 'Tributação', icon: <Percent size={16} /> },
          { key: 'aparencia', label: 'Aparência', icon: <Palette size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'geral' && (
        <Card header={<span className="font-heading text-base font-medium">Dados do perfil</span>}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nome</label>
                <input defaultValue={user?.nome} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input defaultValue={user?.email} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">CRM</label>
                <input defaultValue={user?.crm} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Especialidade</label>
                <input defaultValue={user?.especialidade} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Regime tributário</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option>Simples Nacional</option>
                <option>Lucro Presumido</option>
                <option>Lucro Real</option>
                <option>MEI</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button variant="primary"><Save size={16} /> Salvar</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'planos' && (
        <>
          {/* Plano atual */}
          {planoAtual && (
            <Card className="bg-gradient-to-r from-blue-deep to-blue-mid text-white border-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown size={32} className="text-gold" />
                  <div>
                    <p className="text-xs text-text-on-dark2/60 uppercase tracking-wider">Plano atual</p>
                    <h3 className="font-heading text-2xl font-medium">{planoAtual.nome}</h3>
                    <p className="text-text-on-dark2 text-sm">{planoAtual.preco}</p>
                  </div>
                </div>
                <Badge variant={planStatus === 'active' ? 'green' : planStatus === 'trial' ? 'amber' : 'red'}>
                  {planStatus === 'active' ? 'Ativo' : planStatus === 'trial' ? 'Trial' : 'Expirado'}
                </Badge>
              </div>
            </Card>
          )}

          {/* Upgrade banner for trial users */}
          {planStatus === 'trial' && (
            <Card className="bg-warning-pale border-warning/30">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-warning" />
                <div>
                  <p className="text-sm font-medium text-warning">Você está no período de teste</p>
                  <p className="text-xs text-text-secondary">Escolha um plano abaixo para continuar usando todos os recursos após o trial.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Plan cards */}
          <div className="grid grid-cols-3 gap-4">
            {planos.map((plano) => {
              const isCurrent = planType === plano.key
              const isUpgrade =
                (planType === 'starter' && (plano.key === 'pro' || plano.key === 'clinic')) ||
                (planType === 'pro' && plano.key === 'clinic')

              return (
                <Card key={plano.key} className={`relative ${plano.destaque ? 'ring-2 ring-gold' : ''} ${isCurrent ? 'ring-2 ring-blue-brand' : ''}`}>
                  {plano.destaque && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gold" className="!px-4"><Star size={12} /> Mais popular</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="blue" className="!px-4"><Check size={12} /> Plano atual</Badge>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <h3 className="font-heading text-xl font-medium text-text-primary">{plano.nome}</h3>
                    <p className="text-2xl font-bold text-text-primary mt-2">{plano.preco}</p>
                    <p className="text-xs text-text-secondary mt-1">{plano.desc}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {plano.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-success flex-shrink-0" />
                        <span className="text-text-primary">{f}</span>
                      </div>
                    ))}
                    {plano.limitacoes.map(l => (
                      <div key={l} className="flex items-center gap-2 text-sm opacity-50">
                        <span className="w-3.5 h-3.5 rounded-full border border-text-muted flex items-center justify-center flex-shrink-0"><span className="text-text-muted text-[10px]">-</span></span>
                        <span className="text-text-muted">{l}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    {isCurrent ? (
                      <Button variant="secondary" className="w-full" disabled>Plano atual</Button>
                    ) : (
                      <Button
                        variant={isUpgrade ? 'primary' : 'secondary'}
                        className="w-full"
                        onClick={() => activatePlan(plano.key)}
                      >
                        {isUpgrade ? <><ArrowUp size={14} /> Fazer upgrade</> : 'Assinar'}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Comparativo */}
          <Card header={<span className="font-heading text-base font-medium">📋 Comparativo completo</span>}>
            <Table headers={['Funcionalidade', 'Starter', 'PRO', 'Clínica']}>
              {[
                ['Financeiro', '✓', '✓', '✓'],
                ['Pipeline de Cobranças', '✓', '✓', '✓'],
                ['Glosas', '✓', '✓', '✓'],
                ['Nota Fiscal (NFS-e)', '✓', '✓', '✓'],
                ['Importação de Dados', '✓', '✓', '✓'],
                ['Estoque', '-', '✓', '✓'],
                ['Orçamentos', '-', '✓', '✓'],
                ['Marketing e NPS', '-', '✓', '✓'],
                ['DMED Automática', '-', '✓', '✓'],
                ['Comissionamento', '-', '✓', '✓'],
                ['IA Charcot', '-', '-', '✓'],
                ['Recepção Digital', '-', '-', '✓'],
                ['Equipe e Chat', '-', '-', '✓'],
                ['Multi-clínica', '-', '-', '✓'],
                ['Usuários', '1', '3', 'Ilimitados'],
                ['Suporte', 'Email', 'Prioritário', '24h'],
              ].map(([feature, starter, pro, clinic]) => (
                <tr key={feature} className="hover:bg-blue-pale">
                  <td className="px-4 py-2.5 text-sm text-text-primary">{feature}</td>
                  <td className="px-4 py-2.5 text-center text-sm">{starter === '✓' ? <Check size={16} className="text-success mx-auto" /> : <span className="text-text-muted">-</span>}</td>
                  <td className="px-4 py-2.5 text-center text-sm">{pro === '✓' ? <Check size={16} className="text-success mx-auto" /> : <span className="text-text-muted">-</span>}</td>
                  <td className="px-4 py-2.5 text-center text-sm">{clinic === '✓' ? <Check size={16} className="text-success mx-auto" /> : <span className="text-text-muted">-</span>}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'notificacoes' && (
        <Card header={<span className="font-heading text-base font-medium">Preferências de notificação</span>}>
          <div className="space-y-4">
            {[
              { label: 'Alertas de glosas', desc: 'Receba notificação quando houver novas glosas' },
              { label: 'Lembretes de vencimento', desc: 'Alertas de contas a pagar e a receber' },
              { label: 'Relatórios semanais', desc: 'Resumo financeiro toda segunda-feira' },
              { label: 'Atualizações do sistema', desc: 'Novidades e atualizações do Medvante' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="text-xs text-text-secondary">{item.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:bg-blue-brand after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'tributacao' && <ConfiguracaoTributaria />}

      {tab === 'seguranca' && (
        <Card header={<span className="font-heading text-base font-medium">Segurança da conta</span>}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Senha atual</label>
              <input type="password" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nova senha</label>
                <input type="password" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Confirmar nova senha</label>
                <input type="password" className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
              </div>
            </div>
            <div className="flex justify-end"><Button variant="primary">Atualizar senha</Button></div>
          </div>
        </Card>
      )}

      {tab === 'aparencia' && (
        <Card>
          <p className="text-sm text-text-secondary mb-4">O Medvante usa tema claro como padrão, com a sidebar escura para contraste.</p>
          <div className="flex gap-3">
            <div className="p-4 rounded-xl border-2 border-blue-brand bg-bg-card cursor-pointer">
              <div className="w-24 h-16 rounded-lg bg-bg-app flex items-center justify-center">
                <div className="w-6 h-full rounded-l bg-bg-sidebar" />
                <div className="flex-1 p-1"><div className="h-1 rounded bg-text-primary mb-1" /><div className="h-1 rounded bg-text-muted" /></div>
              </div>
              <p className="text-xs font-medium text-text-primary mt-2 text-center">Claro (padrão)</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function ConfiguracaoTributaria() {
  const { aliquota, regimeTributario, setAliquota, setRegimeTributario } = useFaturamentoStore()

  const regimes: { key: RegimeTributario; label: string; desc: string }[] = [
    { key: 'simples_nacional', label: 'Simples Nacional', desc: 'Alíquota varia conforme faixa de faturamento (6% a 11%)' },
    { key: 'lucro_presumido', label: 'Lucro Presumido', desc: 'PIS 0,65% + COFINS 3% + CSLL 2,88% + IRPJ 4,8% = 11,33%' },
    { key: 'lucro_real', label: 'Lucro Real', desc: 'Alíquota sobre o lucro real apurado — sugerido 16,5%' },
    { key: 'mei', label: 'MEI', desc: 'Valor fixo mensal via DAS — sem alíquota percentual' },
  ]

  return (
    <div className="space-y-4">
      <Card header={<span className="font-heading text-base font-medium"><Calculator size={18} className="inline mr-2" />Configuração de Tributos</span>}>
        <p className="text-sm text-text-secondary mb-4">
          Configure o regime tributário e a alíquota para cálculo automático do imposto retido sobre as notas fiscais emitidas.
        </p>

        <div className="space-y-3">
          {regimes.map(r => (
            <label key={r.key}
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                regimeTributario === r.key
                  ? 'border-blue-brand bg-blue-pale/30 ring-1 ring-blue-brand'
                  : 'border-border hover:border-blue-brand/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{r.desc}</p>
                </div>
                <input type="radio" name="regime" checked={regimeTributario === r.key}
                  onChange={() => setRegimeTributario(r.key)} className="accent-blue-brand" />
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card header={<span className="font-heading text-base font-medium"><Percent size={18} className="inline mr-2" />Alíquota Personalizada</span>}>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-text-primary mb-1">Alíquota de retenção (%)</label>
          <div className="flex items-center gap-2">
            <input type="number" step="0.01" min="0" max="100" value={aliquota}
              onChange={e => setAliquota(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
            <span className="text-sm text-text-secondary">%</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Alíquota atual: {aliquota}% · Imposto retido = Faturamento Bruto × {aliquota}%
          </p>
        </div>
      </Card>

      <Card header={<span className="font-heading text-base font-medium">Resumo da Tributação</span>}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-muted">Regime</p>
            <p className="text-sm font-medium text-text-primary">
              {regimes.find(r => r.key === regimeTributario)?.label || regimeTributario}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Alíquota</p>
            <p className="text-sm font-medium text-text-primary">{aliquota}%</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Tipo de retenção</p>
            <p className="text-sm font-medium text-text-primary">
              {regimeTributario === 'mei' ? 'Valor fixo (DAS)' : 'Percentual sobre faturamento'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
