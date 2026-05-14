import { useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/financeiro': 'Financeiro',
  '/atendimentos': 'Atendimentos',
  '/pipeline': 'Pipeline de Cobranças',
  '/glosas': 'Glosas',
  '/notafiscal': 'Nota Fiscal',
  '/importacao': 'Importação de Histórico',
  '/estoque': 'Estoque',
  '/orcamentos': 'Orçamentos',
  '/marketing': 'Marketing e NPS',
  '/recepcao': 'Recepção',
  '/equipe': 'Equipe',
  '/prontuario': 'Prontuário',
  '/caixa': 'Caixa',
  '/comissionamento': 'Comissionamento',
  '/ia': 'IA Charcot',
  '/integracoes': 'Integrações',
  '/seguranca': 'Segurança',
  '/configuracoes': 'Configurações',
}

interface TopbarProps {
  actions?: React.ReactNode
}

export function Topbar({ actions }: TopbarProps) {
  const location = useLocation()
  const { t } = useI18n()
  const title = pageTitles[location.pathname] || 'Medvante'

  return (
    <header className="h-16 bg-bg-topbar border-b border-border shadow-sm flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="font-heading text-xl font-medium text-text-primary">
        {t(title.toLowerCase()) || title}
      </h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {actions}
      </div>
    </header>
  )
}
