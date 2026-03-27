import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, BookOpen, AlertTriangle, XCircle } from 'lucide-react'
import type { Account, TrainingRecord } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [employeeCount, setEmployeeCount] = useState(0)
  const [courseCount, setCourseCount] = useState(0)
  const [expiring, setExpiring] = useState<TrainingRecord[]>([])
  const [expired, setExpired] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [accs, courses, expiringSoon, expiredRecords] = await Promise.all([
          window.electronAPI.accounts.list(),
          window.electronAPI.courses.list(),
          window.electronAPI.trainingRecords.getExpiringSoon(30),
          window.electronAPI.trainingRecords.getExpired(),
        ])
        setAccounts(accs)
        setCourseCount(courses.length)
        setExpiring(expiringSoon)
        setExpired(expiredRecords)

        // Count employees across all accounts
        let empCount = 0
        for (const acc of accs) {
          const contracts = await window.electronAPI.contracts.listByAccount(acc.id)
          for (const contract of contracts) {
            const sites = await window.electronAPI.sites.listByContract(contract.id)
            for (const site of sites) {
              const employees = await window.electronAPI.employees.listBySite(site.id)
              empCount += employees.length
            }
          }
        }
        setEmployeeCount(empCount)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  const stats = [
    { label: 'Accounts', value: accounts.length, icon: Building2, color: 'text-brand-azureBlue', onClick: () => navigate('/accounts') },
    { label: 'Employees', value: employeeCount, icon: Users, color: 'text-brand-darkGreen', onClick: () => navigate('/employees') },
    { label: 'Courses', value: courseCount, icon: BookOpen, color: 'text-brand-violet', onClick: () => navigate('/courses') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Training compliance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, onClick }) => (
          <Card key={label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="h-4 w-4 text-brand-orange" />
            <CardTitle className="text-sm font-medium">Expiring Soon (30 days)</CardTitle>
            <Badge variant="secondary" className="ml-auto">{expiring.length}</Badge>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No training expiring soon</p>
            ) : (
              <ul className="space-y-1.5 text-sm max-h-48 overflow-auto">
                {expiring.slice(0, 10).map(r => (
                  <li key={r.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate">Employee {r.employee_id.slice(0, 8)}...</span>
                    <span className="text-brand-orange shrink-0 ml-2">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : ''}
                    </span>
                  </li>
                ))}
                {expiring.length > 10 && (
                  <li className="text-xs text-muted-foreground">+{expiring.length - 10} more</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-medium">Expired Training</CardTitle>
            <Badge variant="destructive" className="ml-auto">{expired.length}</Badge>
          </CardHeader>
          <CardContent>
            {expired.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expired training records</p>
            ) : (
              <ul className="space-y-1.5 text-sm max-h-48 overflow-auto">
                {expired.slice(0, 10).map(r => (
                  <li key={r.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate">Employee {r.employee_id.slice(0, 8)}...</span>
                    <span className="text-destructive shrink-0 ml-2">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : ''}
                    </span>
                  </li>
                ))}
                {expired.length > 10 && (
                  <li className="text-xs text-muted-foreground">+{expired.length - 10} more</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
