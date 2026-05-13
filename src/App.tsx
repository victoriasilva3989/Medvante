import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { DashboardPage } from './components/modules/dashboard/DashboardPage'
import { FinanceiroPage } from './components/modules/financeiro/FinanceiroPage'
import { AtendimentosPage } from './components/modules/atendimentos/AtendimentosPage'
import { PipelinePage } from './components/modules/pipeline/PipelinePage'
import { GlosasPage } from './components/modules/glosas/GlosasPage'
import { NotaFiscalPage } from './components/modules/notafiscal/NotaFiscalPage'
import { ImportacaoPage } from './components/modules/importacao/ImportacaoPage'
import { ProducerDashboard } from './components/modules/producer/ProducerDashboard'
import { EstoquePage } from './components/modules/estoque/EstoquePage'
import { OrcamentosPage } from './components/modules/orcamentos/OrcamentosPage'
import { MarketingPage } from './components/modules/marketing/MarketingPage'
import { RecepcaoPage } from './components/modules/recepcao/RecepcaoPage'
import { EquipePage } from './components/modules/equipe/EquipePage'
import { IaPage } from './components/modules/ia/IaPage'
import { IntegracoesPage } from './components/modules/integracoes/IntegracoesPage'
import { SegurancaPage } from './pages/SegurancaPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { useAuthStore } from './store/authStore'
import { useTrialStore } from './store/trialStore'
import { PaywallGate } from './components/trial/PaywallGate'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function TrialGuard({ children, feature, description }: { children: React.ReactNode; feature: string; description: string }) {
  return <PaywallGate feature={feature} description={description}>{children}</PaywallGate>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/cadastro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/esqueci-senha" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/produtor" element={<TrialGuard feature="starter" description="Acesso ao painel do produtor."><ProducerDashboard /></TrialGuard>} />
          <Route path="/financeiro" element={<TrialGuard feature="starter" description="Gerencie suas finanças, contas a receber e a pagar."><FinanceiroPage /></TrialGuard>} />
          <Route path="/atendimentos" element={<TrialGuard feature="starter" description="Cadastre e gerencie seus atendimentos e agenda."><AtendimentosPage /></TrialGuard>} />
          <Route path="/pipeline" element={<TrialGuard feature="starter" description="Pipeline de cobrança e recuperação de crédito."><PipelinePage /></TrialGuard>} />
          <Route path="/glosas" element={<TrialGuard feature="starter" description="Gestão de glosas e recursos."><GlosasPage /></TrialGuard>} />
          <Route path="/notafiscal" element={<TrialGuard feature="starter" description="Emissão de notas fiscais NFS-e e NF-e."><NotaFiscalPage /></TrialGuard>} />
          <Route path="/importacao" element={<TrialGuard feature="starter" description="Importe seus dados de outras plataformas."><ImportacaoPage /></TrialGuard>} />
          <Route path="/estoque" element={<TrialGuard feature="pro" description="Gerencie seu estoque de materiais e insumos."><EstoquePage /></TrialGuard>} />
          <Route path="/orcamentos" element={<TrialGuard feature="pro" description="Crie e gerencie orçamentos para pacientes."><OrcamentosPage /></TrialGuard>} />
          <Route path="/marketing" element={<TrialGuard feature="pro" description="Campanhas de marketing e pesquisa NPS."><MarketingPage /></TrialGuard>} />
          <Route path="/recepcao" element={<TrialGuard feature="clinic" description="Recepção digital para sua clínica."><RecepcaoPage /></TrialGuard>} />
          <Route path="/equipe" element={<TrialGuard feature="clinic" description="Gestão de equipe e permissões."><EquipePage /></TrialGuard>} />
          <Route path="/ia" element={<IaPage />} />
          <Route path="/integracoes" element={<TrialGuard feature="clinic" description="Integrações com bancos, convênios e marketplaces."><IntegracoesPage /></TrialGuard>} />
          <Route path="/seguranca" element={<SegurancaPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
