import { useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'

const pageTitleKeys: Record<string, string> = {
  '/dashboard': 'nav_dashboard',
  '/financeiro': 'nav_financeiro',
  '/atendimentos': 'nav_atendimentos',
  '/pipeline': 'nav_pipeline',
  '/glosas': 'nav_glosas',
  '/notafiscal': 'nav_notafiscal',
  '/importacao': 'nav_importacao',
  '/estoque': 'nav_estoque',
  '/orcamentos': 'nav_orcamentos',
  '/marketing': 'nav_marketing',
  '/recepcao': 'nav_recepcao',
  '/equipe': 'nav_equipe',
  '/ia': 'nav_ia',
  '/integracoes': 'nav_integracoes',
  '/seguranca': 'nav_seguranca',
  '/configuracoes': 'nav_configuracoes',
}

interface TopbarProps {
  actions?: React.ReactNode
}

export function Topbar({ actions }: TopbarProps) {
  const location = useLocation()
  const { t } = useI18n()
  const titleKey = pageTitleKeys[location.pathname] || 'app_name'
  const title = t(titleKey as any)

  return (
    <header className="h-16 bg-bg-topbar border-b border-border shadow-sm flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="font-heading text-xl font-medium text-text-primary">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {actions}
      </div>
    </header>
  )
}
