import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { TrackerPage } from '@/pages/TrackerPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
