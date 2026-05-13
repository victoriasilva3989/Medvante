import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, DollarSign, Calendar, GitBranch, AlertTriangle,
  FileText, Upload, Package, FileSpreadsheet, Megaphone, DoorOpen,
  Users, Brain, Puzzle, Settings, Shield, ChevronLeft, ChevronRight,
  UsersRound, LogOut, UserCog
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
  pro?: boolean
  clinic?: boolean
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isCollaborativeMode, activeCollaborator, setCollaborativeMode, logout, impersonatedClient, originalUser, restoreFromImpersonation } = useAuthStore()
  const { t } = useI18n()

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname

  const navGroups: { groupKey: string; items: NavItem[] }[] = [
    {
      groupKey: 'nav_principal',
      items: [
        { labelKey: 'nav_dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { labelKey: 'nav_financeiro', label: 'Financeiro', icon: <DollarSign size={18} />, path: '/financeiro' },
        { labelKey: 'nav_atendimentos', label: 'Atendimentos', icon: <Calendar size={18} />, path: '/atendimentos' },
        { labelKey: 'nav_pipeline', label: 'Pipeline', icon: <GitBranch size={18} />, path: '/pipeline' },
        { labelKey: 'nav_glosas', label: 'Glosas', icon: <AlertTriangle size={18} />, path: '/glosas' },
        { labelKey: 'nav_notafiscal', label: 'Nota Fiscal', icon: <FileText size={18} />, path: '/notafiscal' },
      ],
    },
    {
      groupKey: 'nav_dados',
      items: [
        { labelKey: 'nav_importacao', label: 'Importação', icon: <Upload size={18} />, path: '/importacao' },
        { labelKey: 'nav_estoque', label: 'Estoque', icon: <Package size={18} />, path: '/estoque', pro: true },
        { labelKey: 'nav_orcamentos', label: 'Orçamentos', icon: <FileSpreadsheet size={18} />, path: '/orcamentos', pro: true },
        { labelKey: 'nav_marketing', label: 'Marketing/NPS', icon: <Megaphone size={18} />, path: '/marketing', pro: true },
      ],
    },
    {
      groupKey: 'nav_avancado',
      items: [
        { labelKey: 'nav_recepcao', label: 'Recepção', icon: <DoorOpen size={18} />, path: '/recepcao', clinic: true },
        { labelKey: 'nav_equipe', label: 'Equipe', icon: <Users size={18} />, path: '/equipe', clinic: true },
        { labelKey: 'nav_ia', label: 'IA Charcot', icon: <Brain size={18} />, path: '/ia', clinic: true },
      ],
    },
    {
      groupKey: 'nav_sistema',
      items: [
        { labelKey: 'nav_integracoes', label: 'Integrações', icon: <Puzzle size={18} />, path: '/integracoes' },
        { labelKey: 'nav_seguranca', label: 'Segurança', icon: <Shield size={18} />, path: '/seguranca' },
        { labelKey: 'nav_configuracoes', label: 'Configurações', icon: <Settings size={18} />, path: '/configuracoes' },
      ],
    },
  ]

  const showProducerNav = user?.role === 'producer' || (originalUser?.role === 'producer' && impersonatedClient)

  return (
    <aside className={`h-screen bg-bg-sidebar flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <svg width="28" height="22" viewBox="0 0 90 70" fill="none" className="flex-shrink-0">
          <path d="M6 62 L22 16 L45 44 L68 8 L84 62" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="84" cy="62" r="4" fill="#2563EB"/>
        </svg>
        {!collapsed && (
          <span className="font-heading text-sm tracking-[6px] text-text-on-dark font-medium">
            <span style={{ color: '#93C5FD' }}>med</span><span style={{ color: '#2563EB' }}>vante</span>
          </span>
        )}
      </div>

      {/* Impersonation Banner */}
      {impersonatedClient && originalUser && !collapsed && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2">
            <UserCog size={14} className="text-warning" />
            <span className="text-xs text-warning font-medium">{t('collaborative_mode_active')}</span>
          </div>
          <p className="text-[10px] text-text-on-dark2 mt-0.5">{t('collaborative_accessing_as')} {impersonatedClient.nome}</p>
          <button onClick={() => { restoreFromImpersonation(); navigate('/produtor') }} className="text-[10px] text-warning hover:underline mt-1 cursor-pointer">
            {t('producer_exit')}
          </button>
        </div>
      )}

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
        {showProducerNav && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-medium text-warning/70 uppercase tracking-[2px] mb-2">PRODUTOR</p>
            )}
            <div className="space-y-0.5">
              <button
                onClick={() => navigate('/produtor')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  collapsed ? 'justify-center' : ''
                } ${
                  currentPath === '/produtor'
                    ? 'bg-warning/10 text-warning border-l-2 border-warning'
                    : 'text-text-on-dark2 hover:text-text-on-dark hover:bg-white/5'
                }`}
                title={collapsed ? t('prod_title') : undefined}
              >
                <UserCog size={18} />
                {!collapsed && <span className="flex-1 text-left text-sm">{t('prod_title')}</span>}
              </button>
            </div>
          </div>
        )}

        {navGroups.map((group) => (
          <div key={group.groupKey}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-medium text-text-on-dark2/50 uppercase tracking-[2px] mb-2">
                {t(group.groupKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentPath === item.path
                const isDisabled = (item.pro && user?.planType === 'starter') || (item.clinic && user?.planType !== 'clinic' && user?.planType !== undefined)

                return (
                  <button
                    key={item.labelKey}
                    onClick={() => item.path && !isDisabled && navigate(item.path)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-blue-brand/10 text-text-on-dark border-l-2 border-blue-brand'
                        : 'text-text-on-dark2 hover:text-text-on-dark hover:bg-white/5'
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <span className={isActive ? 'text-blue-brand' : ''}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{t(item.labelKey)}</span>
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
