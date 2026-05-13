import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { useAuthStore } from '../store/authStore'
import { Save, User, Bell, Shield, Palette } from 'lucide-react'

export function ConfiguracoesPage() {
  const [tab, setTab] = useState('geral')
  const { user } = useAuthStore()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Tabs
        tabs={[
          { key: 'geral', label: 'Geral', icon: <User size={16} /> },
          { key: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
          { key: 'seguranca', label: 'Segurança', icon: <Shield size={16} /> },
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
