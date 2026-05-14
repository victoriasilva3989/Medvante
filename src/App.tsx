import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { PrivateRoute } from './components/PrivateRoute'
import { useAuthStore } from './store/authStore'
import { PaywallGate } from './components/trial/PaywallGate'

const DashboardPage = lazy(() => import('./components/modules/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const FinanceiroPage = lazy(() => import('./components/modules/financeiro/FinanceiroPage').then(m => ({ default: m.FinanceiroPage })))
const AtendimentosPage = lazy(() => import('./components/modules/atendimentos/AtendimentosPage').then(m => ({ default: m.AtendimentosPage })))
const PipelinePage = lazy(() => import('./components/modules/pipeline/PipelinePage').then(m => ({ default: m.PipelinePage })))
const GlosasPage = lazy(() => import('./components/modules/glosas/GlosasPage').then(m => ({ default: m.GlosasPage })))
const NotaFiscalPage = lazy(() => import('./components/modules/notafiscal/NotaFiscalPage').then(m => ({ default: m.NotaFiscalPage })))
const ImportacaoPage = lazy(() => import('./components/modules/importacao/ImportacaoPage').then(m => ({ default: m.ImportacaoPage })))
const ProducerDashboard = lazy(() => import('./components/modules/producer/ProducerDashboard').then(m => ({ default: m.ProducerDashboard })))
const EstoquePage = lazy(() => import('./components/modules/estoque/EstoquePage').then(m => ({ default: m.EstoquePage })))
const OrcamentosPage = lazy(() => import('./components/modules/orcamentos/OrcamentosPage').then(m => ({ default: m.OrcamentosPage })))
const MarketingPage = lazy(() => import('./components/modules/marketing/MarketingPage').then(m => ({ default: m.MarketingPage })))
const RecepcaoPage = lazy(() => import('./components/modules/recepcao/RecepcaoPage').then(m => ({ default: m.RecepcaoPage })))
const EquipePage = lazy(() => import('./components/modules/equipe/EquipePage').then(m => ({ default: m.EquipePage })))
const ProntuarioPage = lazy(() => import('./components/modules/prontuario/ProntuarioPage').then(m => ({ default: m.ProntuarioPage })))
const CaixaPage = lazy(() => import('./components/modules/caixa/CaixaPage').then(m => ({ default: m.CaixaPage })))
const ComissionamentoPage = lazy(() => import('./components/modules/comissionamento/ComissionamentoPage').then(m => ({ default: m.ComissionamentoPage })))
const IaPage = lazy(() => import('./components/modules/ia/IaPage').then(m => ({ default: m.IaPage })))
const IntegracoesPage = lazy(() => import('./components/modules/integracoes/IntegracoesPage').then(m => ({ default: m.IntegracoesPage })))
const PrecificacaoPage = lazy(() => import('./components/modules/precificacao/PrecificacaoPage').then(m => ({ default: m.PrecificacaoPage })))
const CrmPage = lazy(() => import('./components/modules/crm/CrmPage').then(m => ({ default: m.CrmPage })))
const SegurancaPage = lazy(() => import('./pages/SegurancaPage').then(m => ({ default: m.SegurancaPage })))
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })))

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
            <PrivateRoute>
              <Suspense fallback={<div className="p-8 text-text-secondary text-sm">Carregando...</div>}>
                <Layout />
              </Suspense>
            </PrivateRoute>
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
          <Route path="/prontuario" element={<TrialGuard feature="pro" description="Prontuário eletrônico com evoluções, protocolos e prescrições."><ProntuarioPage /></TrialGuard>} />
          <Route path="/caixa" element={<TrialGuard feature="pro" description="Controle de caixa diário com abertura e fechamento."><CaixaPage /></TrialGuard>} />
          <Route path="/comissionamento" element={<TrialGuard feature="pro" description="Regras de comissionamento e cálculo automático."><ComissionamentoPage /></TrialGuard>} />
          <Route path="/ia" element={<IaPage />} />
          <Route path="/integracoes" element={<TrialGuard feature="clinic" description="Integrações com bancos, convênios e marketplaces."><IntegracoesPage /></TrialGuard>} />
          <Route path="/precificacao" element={<TrialGuard feature="pro" description="Precificação automática de procedimentos com base em custos."><PrecificacaoPage /></TrialGuard>} />
          <Route path="/crm" element={<TrialGuard feature="pro" description="CRM para captação e gestão de leads."><CrmPage /></TrialGuard>} />
          <Route path="/seguranca" element={<SegurancaPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
