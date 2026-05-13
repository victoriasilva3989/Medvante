import { useTrialStore } from '../../store/trialStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

interface PaywallGateProps {
  feature: string
  description: string
  children: ReactNode
}

const planPrices = {
  starter: { name: 'Starter', price: 'R$ 297/mês', features: ['Financeiro', 'Pipeline', 'Glosas', 'NF-e'] },
  pro: { name: 'PRO', price: 'R$ 497/mês', features: ['Tudo do Starter', 'Estoque', 'Orçamentos', 'Marketing/NPS', 'DMED', '3 usuários'] },
  clinic: { name: 'Clínica', price: 'R$ 897/mês', features: ['Tudo do PRO', 'IA Charcot', 'Recepção', 'Equipe/Chat', 'Multi-clínica'] },
}

export function PaywallGate({ feature, description, children }: PaywallGateProps) {
  const { planStatus, planType, activatePlan } = useTrialStore()

  if (planStatus === 'trial') return <>{children}</>
  if (planStatus === 'active' && planType === 'clinic') return <>{children}</>
  if (planStatus === 'active' && (planType === 'starter' || planType === 'pro')) {
    if (feature === 'pro' || feature === 'clinic') {
      // Show paywall for PRO features on Starter, or Clinic features on non-Clinic
      const neededPlan = feature === 'pro' ? 'pro' : 'clinic'
      const neededTier = feature === 'clinic' ? 'clinic' : 'pro'
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <Card className="max-w-xl w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-pale flex items-center justify-center">
                <Lock size={28} className="text-blue-mid" />
              </div>
            </div>
            <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
              Este módulo requer o plano {neededPlan === 'pro' ? 'PRO' : 'Clínica'}
            </h2>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">{description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {planPrices[neededTier] && (
                <div className={`p-4 rounded-xl border-2 ${neededTier === 'clinic' ? 'border-gold bg-gold-pale/30' : 'border-blue-brand bg-blue-pale/30'}`}>
                  <h3 className="font-heading text-lg font-medium">{planPrices[neededTier].name}</h3>
                  <p className="text-2xl font-bold text-text-primary mt-1">{planPrices[neededTier].price}</p>
                  <ul className="text-xs text-text-secondary mt-3 space-y-1">
                    {planPrices[neededTier].features.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                  <Button className="mt-4 w-full" onClick={() => activatePlan(neededTier)}>Escolher plano</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )
    }
  }

  if (planStatus === 'expired' || planStatus === 'grace') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-xl w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-danger-pale flex items-center justify-center">
              <Lock size={28} className="text-danger" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">Este módulo requer um plano ativo</h2>
          <p className="text-text-secondary text-sm mb-6">{description}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(planPrices).map(([key, plan]) => (
              <div key={key} className="p-4 rounded-xl border border-border">
                <h3 className="font-heading text-lg font-medium">{plan.name}</h3>
                <p className="text-xl font-bold text-text-primary mt-1">{plan.price}</p>
                <ul className="text-xs text-text-secondary mt-3 space-y-1 text-left">
                  {plan.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <Button className="mt-4 w-full" size="sm" onClick={() => activatePlan(key as 'starter' | 'pro' | 'clinic')}>
                  Assinar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
