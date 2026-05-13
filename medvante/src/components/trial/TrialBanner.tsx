import { useTrialStore } from '../../store/trialStore'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'

export function TrialBanner() {
  const { planStatus, getDaysRemaining } = useTrialStore()
  const { t } = useI18n()
  const daysLeft = getDaysRemaining()

  if (planStatus !== 'trial' && planStatus !== 'grace') return null
  if (daysLeft <= 0 && planStatus !== 'grace') return null

  const isUrgent = daysLeft <= 3

  const message = planStatus === 'grace'
    ? t('trial_grace')
    : isUrgent
      ? t('trial_urgent', { days: daysLeft, days_plural: daysLeft === 1 ? t('trial_day') : t('trial_days') })
      : t('trial_ending_soon', { days: daysLeft, days_plural: daysLeft === 1 ? t('trial_day') : t('trial_days') })

  return (
    <div
      className={`h-9 flex items-center justify-between px-6 text-xs font-medium ${
        isUrgent ? 'bg-danger-pale text-danger border-b border-danger/20' : 'bg-gold-pale text-warning border-b border-gold-border'
      }`}
    >
      <span>{message}</span>
      <Button variant={isUrgent ? 'danger' : 'primary'} size="sm">
        {t('trial_subscribe')}
      </Button>
    </div>
  )
}
