import { useTrialStore } from '../../store/trialStore'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export function TrialBanner() {
  const navigate = useNavigate()
  const { planStatus, getDaysRemaining } = useTrialStore()
  const daysLeft = getDaysRemaining()

  if (planStatus !== 'trial' && planStatus !== 'grace') return null
  if (daysLeft <= 0 && planStatus !== 'grace') return null

  const isUrgent = daysLeft <= 3

  return (
    <div
      className={`h-9 flex items-center justify-between px-6 text-xs font-medium ${
        isUrgent ? 'bg-danger-pale text-danger border-b border-danger/20' : 'bg-gold-pale text-warning border-b border-gold-border'
      }`}
    >
      <span>
        {planStatus === 'grace'
          ? 'Período de carência — assine agora para não perder o acesso'
          : `Período gratuito termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} — aproveite ao máximo!`
        }
      </span>
      <Button variant={isUrgent ? 'danger' : 'primary'} size="sm" onClick={() => navigate('/configuracoes')}>
        Assinar agora →
      </Button>
    </div>
  )
}
