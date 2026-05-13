import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { SecurityBadge } from '../ui/SecurityBadge'
import { Button } from '../ui/Button'
import { Eye, EyeOff, Stethoscope } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError(t('login_error_required'))
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError(t('login_error_invalid'))
    }
  }

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg width="60" height="48" viewBox="0 0 90 70" fill="none">
              <path d="M6 62 L22 16 L45 44 L68 8 L84 62" stroke="url(#login-grad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="84" cy="62" r="5" fill="#2563EB"/>
              <defs>
                <linearGradient id="login-grad" x1="6" y1="62" x2="84" y2="8">
                  <stop stopColor="#0F3460"/>
                  <stop offset="0.5" stopColor="#1A4D8F"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-medium text-text-primary">
            <span style={{ color: '#93C5FD' }}>med</span><span style={{ color: '#2563EB' }}>vante</span>
          </h1>
            <p className="text-text-secondary mt-1 text-sm">{t('app_tagline')}</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card rounded-xl shadow-md border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('login_email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login_email_placeholder')}
                className="w-full px-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('login_password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login_password_placeholder')}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger-pale px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              <Stethoscope size={18} />
              {t('login_button')}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/esqueci-senha" className="text-blue-brand hover:underline">{t('login_forgot')}</Link>
            <Link to="/cadastro" className="text-blue-brand hover:underline font-medium">Cadastre-se agora</Link>
          </div>

          <div className="mt-6 text-center text-xs text-text-muted">
            <p>{t('login_demo_hint')} <strong className="text-text-secondary">admin@medvante.com.br</strong></p>
            <p className="mt-1"><strong className="text-text-secondary">produtor@medvante.com.br</strong> ({t('producer_access')})</p>
          </div>
        </div>

        {/* Trust seals */}
        <div className="mt-6 flex justify-center">
          <SecurityBadge />
        </div>

        {/* Collaborative access hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-text-muted">
            {t('login_support_hint')}
          </p>
        </div>
      </div>
    </div>
  )
}
