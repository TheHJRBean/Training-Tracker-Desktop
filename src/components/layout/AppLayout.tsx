import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CommitTag } from './CommitTag'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6 max-w-[1200px]">
          <Outlet />
        </div>
      </main>
      <CommitTag />
    </div>
  )
}
