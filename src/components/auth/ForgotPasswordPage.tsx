import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { SecurityBadge } from '../ui/SecurityBadge'
import { Button } from '../ui/Button'
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [recoveredPw, setRecoveredPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const { getPasswordForEmail } = useAuthStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Informe seu email cadastrado.'); return }

    const pw = getPasswordForEmail(email)
    if (pw) {
      setRecoveredPw(pw)
      setIsDemo(true)
    } else {
      setIsDemo(false)
      setRecoveredPw('')
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[440px]">
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
        </div>

        <div className="bg-bg-card rounded-xl shadow-md border border-border p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-medium text-text-primary">Redefinir senha</h2>
                <p className="text-sm text-text-secondary mt-1">Informe seu email cadastrado e enviaremos um link de redefinição.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                </div>
              </div>

              {error && <p className="text-xs text-danger bg-danger-pale px-3 py-2 rounded-lg">{error}</p>}

              <Button type="submit" className="w-full">Enviar link de redefinição</Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-brand hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Voltar ao login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-success-pale flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="text-lg font-medium text-text-primary">
                {isDemo ? 'Senha recuperada' : 'Email enviado!'}
              </h2>
              <p className="text-sm text-text-secondary">
                {isDemo
                  ? 'Modo demonstração — como não há servidor de email configurado, exibimos a senha abaixo:'
                  : `Enviamos um link de redefinição para ${email}. Verifique sua caixa de entrada e spam.`
                }
              </p>

              {isDemo && recoveredPw && (
                <div className="bg-blue-pale rounded-xl p-4 space-y-2">
                  <p className="text-xs text-text-muted">Sua senha é:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-lg font-bold text-blue-brand font-mono">
                      {showPw ? recoveredPw : '••••••••'}
                    </code>
                    <button onClick={() => setShowPw(!showPw)} className="text-text-muted hover:text-text-primary cursor-pointer">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Em produção, um email seria enviado com instruções de redefinição.
                  </p>
                </div>
              )}

              {!isDemo && (
                <p className="text-xs text-warning bg-warning-pale px-3 py-2 rounded-lg">
                  Email não encontrado na base de demonstração.
                </p>
              )}

              <Link to="/login" className="text-sm text-blue-brand hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Voltar ao login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <SecurityBadge />
        </div>
      </div>
    </div>
  )
}
