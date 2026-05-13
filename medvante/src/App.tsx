import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './components/modules/dashboard/DashboardPage'
import { FinanceiroPage } from './components/modules/financeiro/FinanceiroPage'
import { AtendimentosPage } from './components/modules/atendimentos/AtendimentosPage'
import { PipelinePage } from './components/modules/pipeline/PipelinePage'
import { GlosasPage } from './components/modules/glosas/GlosasPage'
import { NotaFiscalPage } from './components/modules/notafiscal/NotaFiscalPage'
import { ImportacaoPage } from './components/modules/importacao/ImportacaoPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/atendimentos" element={<AtendimentosPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/glosas" element={<GlosasPage />} />
          <Route path="/notafiscal" element={<NotaFiscalPage />} />
          <Route path="/importacao" element={<ImportacaoPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/orcamentos" element={<OrcamentosPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/recepcao" element={<RecepcaoPage />} />
          <Route path="/equipe" element={<EquipePage />} />
          <Route path="/ia" element={<IaPage />} />
          <Route path="/integracoes" element={<IntegracoesPage />} />
          <Route path="/seguranca" element={<SegurancaPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
