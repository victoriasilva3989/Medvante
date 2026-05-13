import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { SecurityBadge } from '../ui/SecurityBadge'
import { Button } from '../ui/Button'
import { Eye, EyeOff, Stethoscope, User, Hash, HeartPulse } from 'lucide-react'

export function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [crm, setCrm] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nome || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    const success = await register({ nome, email, password, crm, especialidade })
    if (success) {
      navigate('/configuracoes')
    } else {
      setError('Este email já está cadastrado.')
    }
  }

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[480px]">
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
          <p className="text-text-secondary mt-1 text-sm">Criar sua conta</p>
        </div>

        <div className="bg-bg-card rounded-xl shadow-md border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Nome completo <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Dr. Seu Nome"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email <span className="text-danger">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">CRM</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={crm} onChange={e => setCrm(e.target.value)}
                    placeholder="000000-SP"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Especialidade</label>
              <div className="relative">
                  <HeartPulse size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)}
                  placeholder="Cardiologia, Dermatologia..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Senha <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Confirmar senha <span className="text-danger">*</span>
                </label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full px-4 py-2.5 rounded-lg border border-border-strong text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
              </div>
            </div>

            {error && <p className="text-xs text-danger bg-danger-pale px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" className="w-full" size="lg">
              <Stethoscope size={18} /> Criar conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Já tem conta?{' '}
              <Link to="/login" className="text-blue-brand hover:underline font-medium">Fazer login</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <SecurityBadge />
        </div>
      </div>
    </div>
  )
}
