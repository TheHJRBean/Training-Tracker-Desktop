import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: Building2, label: 'Accounts' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/tracker', icon: ClipboardCheck, label: 'Tracker' },
]

export function Sidebar() {
  return (
    <aside className="w-56 bg-brand-darkBlue text-white flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold text-brand-turquoise tracking-tight">
          Training Tracker
        </h1>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-turquoise/20 text-brand-turquoise'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
        Training Compliance Tracker
      </div>
    </aside>
  )
}
