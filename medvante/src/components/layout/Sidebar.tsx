import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, DollarSign, Calendar, GitBranch, AlertTriangle,
  FileText, Upload, Package, FileSpreadsheet, Megaphone, DoorOpen,
  Users, Brain, Puzzle, Settings, Shield, ChevronLeft, ChevronRight,
  UsersRound, LogOut
} from 'lucide-react'
import { SecurityBadge } from '../ui/SecurityBadge'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../i18n/useI18n'
import { Badge } from '../ui/Badge'
import type { ReactNode } from 'react'

interface NavItem {
  label: string
  labelKey: string
  icon: ReactNode
  path?: string
  badge?: string
  pro?: boolean
  clinic?: boolean
}

const navGroups: { group: string; groupKey: string; items: NavItem[] }[] = [
  {
    group: 'Principal', groupKey: 'nav_principal',
    items: [
      { label: 'Dashboard', labelKey: 'nav_dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
      { label: 'Financeiro', labelKey: 'nav_financeiro', icon: <DollarSign size={18} />, path: '/financeiro' },
      { label: 'Atendimentos', labelKey: 'nav_atendimentos', icon: <Calendar size={18} />, path: '/atendimentos' },
      { label: 'Pipeline', labelKey: 'nav_pipeline', icon: <GitBranch size={18} />, path: '/pipeline' },
      { label: 'Glosas', labelKey: 'nav_glosas', icon: <AlertTriangle size={18} />, path: '/glosas' },
      { label: 'Nota Fiscal', labelKey: 'nav_notafiscal', icon: <FileText size={18} />, path: '/notafiscal' },
    ],
  },
  {
    group: 'Dados', groupKey: 'nav_dados',
    items: [
      { label: 'Importação', labelKey: 'nav_importacao', icon: <Upload size={18} />, path: '/importacao' },
      { label: 'Estoque', labelKey: 'nav_estoque', icon: <Package size={18} />, path: '/estoque', pro: true },
      { label: 'Orçamentos', labelKey: 'nav_orcamentos', icon: <FileSpreadsheet size={18} />, path: '/orcamentos', pro: true },
      { label: 'Marketing/NPS', labelKey: 'nav_marketing', icon: <Megaphone size={18} />, path: '/marketing', pro: true },
    ],
  },
  {
    group: 'Avançado', groupKey: 'nav_avancado',
    items: [
      { label: 'Recepção', labelKey: 'nav_recepcao', icon: <DoorOpen size={18} />, path: '/recepcao', clinic: true },
      { label: 'Equipe', labelKey: 'nav_equipe', icon: <Users size={18} />, path: '/equipe', clinic: true },
      { label: 'IA Charcot', labelKey: 'nav_ia', icon: <Brain size={18} />, path: '/ia', clinic: true },
    ],
  },
  {
    group: 'Sistema', groupKey: 'nav_sistema',
    items: [
      { label: 'Integrações', labelKey: 'nav_integracoes', icon: <Puzzle size={18} />, path: '/integracoes' },
      { label: 'Segurança', labelKey: 'nav_seguranca', icon: <Shield size={18} />, path: '/seguranca' },
      { label: 'Configurações', labelKey: 'nav_configuracoes', icon: <Settings size={18} />, path: '/configuracoes' },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isCollaborativeMode, activeCollaborator, setCollaborativeMode, logout } = useAuthStore()
  const { t } = useI18n()

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname

  return (
    <aside className={`h-screen bg-bg-sidebar flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <svg width="28" height="22" viewBox="0 0 90 70" fill="none" className="flex-shrink-0">
          <path d="M6 62 L22 16 L45 44 L68 8 L84 62" stroke="#2563EB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="84" cy="62" r="4" fill="#2563EB"/>
        </svg>
        {!collapsed && (
          <span className="font-heading text-sm tracking-[6px] text-text-on-dark font-medium">
            <span style={{ color: '#0F3460' }}>med</span><span style={{ color: '#2563EB' }}>vante</span>
          </span>
        )}
      </div>

      {/* Collaborative Mode Banner */}
      {isCollaborativeMode && activeCollaborator && !collapsed && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-blue-brand/10 border border-blue-brand/20">
          <div className="flex items-center gap-2">
            <UsersRound size={14} className="text-blue-brand" />
            <span className="text-xs text-blue-brand font-medium">{t('collaborative_mode_active')}</span>
          </div>
          <p className="text-[10px] text-text-on-dark2 mt-0.5">{t('collaborative_accessing_as', { name: activeCollaborator.nome })}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-medium text-text-on-dark2/50 uppercase tracking-[2px] mb-2">
                {t(group.groupKey as any)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentPath === item.path
                const isDisabled = (item.pro && user?.planType === 'starter') || (item.clinic && user?.planType !== 'clinic' && user?.planType !== undefined)

                return (
                  <button
                    key={item.label}
                    onClick={() => item.path && !isDisabled && navigate(item.path)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-blue-brand/10 text-text-on-dark border-l-2 border-blue-brand'
                        : 'text-text-on-dark2 hover:text-text-on-dark hover:bg-white/5'
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={collapsed ? t(item.labelKey as any) : undefined}
                  >
                    <span className={isActive ? 'text-blue-brand' : ''}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{t(item.labelKey as any)}</span>
                        {item.pro && <Badge variant="gold">{t('nav_pro_badge')}</Badge>}
                        {item.clinic && <Badge variant="gold">{t('nav_clinic_badge')}</Badge>}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/5 p-4 space-y-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-mid flex items-center justify-center text-white text-xs font-medium">
              {user?.nome?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-on-dark truncate">{user?.nome}</p>
              <p className="text-[10px] text-text-on-dark2/60 truncate">{user?.crm || user?.email}</p>
            </div>
          </div>
        )}

        {/* Collaborative Access Toggle */}
        <button
          onClick={() => setCollaborativeMode(!isCollaborativeMode)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          } ${
            isCollaborativeMode ? 'bg-blue-brand/10 text-blue-brand' : 'text-text-on-dark2 hover:text-text-on-dark hover:bg-white/5'
          }`}
          title={t('nav_collaborative')}
        >
          <UsersRound size={14} />
          {!collapsed && <span>{isCollaborativeMode ? t('nav_exit_collaborative') : t('nav_collaborative')}</span>}
        </button>

        {!collapsed && <SecurityBadge />}

        {!collapsed && (
          <button onClick={() => logout()} className="w-full flex items-center gap-2 text-xs text-text-on-dark2/60 hover:text-danger transition-colors cursor-pointer">
            <LogOut size={14} /> {t('nav_logout')}
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-on-dark2/40 hover:text-text-on-dark transition-colors cursor-pointer flex justify-center w-full"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
