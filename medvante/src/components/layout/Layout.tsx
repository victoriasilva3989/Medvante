import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { TrialBanner } from '../trial/TrialBanner'
import { CollaborativePanel } from '../auth/CollaborativePanel'
import { useAuthStore } from '../../store/authStore'

export function Layout() {
  const { isCollaborativeMode } = useAuthStore()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <TrialBanner />
        <main className="flex-1 overflow-y-auto bg-bg-app p-6">
          <Outlet />
        </main>
      </div>
      {isCollaborativeMode && <CollaborativePanel />}
    </div>
  )
}
