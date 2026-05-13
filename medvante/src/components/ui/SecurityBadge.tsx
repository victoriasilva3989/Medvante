import { Shield } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'

export function SecurityBadge() {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2 text-text-on-dark2 text-xs">
      <Shield size={12} className="text-gold" />
      <span>{t('security_badge')}</span>
      <span className="text-text-on-dark2/60">·</span>
      <span className="text-text-on-dark2/60">{t('security_lgpd')}</span>
    </div>
  )
}
