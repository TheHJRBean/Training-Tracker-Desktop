import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CheckCircle2, XCircle, AlertTriangle, Clock, Minus } from 'lucide-react'
import type {
  Account, Contract, Site, Course,
  EmployeeWithAttributes, EmployeeCourseRequirement, TrainingRecord,
  CellStatus,
} from '@/types'

interface MatrixCell {
  status: CellStatus
  record?: TrainingRecord
  requirement?: EmployeeCourseRequirement
}

function getCellStatus(
  requirement: EmployeeCourseRequirement | undefined,
  record: TrainingRecord | undefined,
): CellStatus {
  if (!requirement) return 'NOT_REQUIRED'
  if (!record) return 'NOT_STARTED'
  if (record.expires_at) {
    const expires = new Date(record.expires_at)
    const now = new Date()
    if (expires < now) return 'EXPIRED'
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    if (expires < thirtyDaysFromNow) return 'EXPIRING_SOON'
  }
  return 'COMPLETED'
}

const statusConfig: Record<CellStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  COMPLETED: { icon: CheckCircle2, color: 'text-brand-darkGreen bg-brand-turquoise/20', label: 'Completed' },
  EXPIRED: { icon: XCircle, color: 'text-destructive bg-destructive/10', label: 'Expired' },
  EXPIRING_SOON: { icon: AlertTriangle, color: 'text-brand-orange bg-brand-orange/10', label: 'Expiring Soon' },
  NOT_STARTED: { icon: Clock, color: 'text-brand-azureBlue bg-brand-azureBlue/10', label: 'Not Started' },
  NOT_REQUIRED: { icon: Minus, color: 'text-muted-foreground bg-muted/30', label: 'Not Required' },
}

export function TrackerPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [allSites, setAllSites] = useState<Site[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  const [employees, setEmployees] = useState<EmployeeWithAttributes[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [matrix, setMatrix] = useState<Record<string, Record<string, MatrixCell>>>({})
  const [loading, setLoading] = useState(true)
  const [matrixLoading, setMatrixLoading] = useState(false)

  // Mark complete dialog
  const [markDialog, setMarkDialog] = useState<{ employeeId: string; courseId: string; employeeName: string; courseName: string } | null>(null)
  const [completedDate, setCompletedDate] = useState('')
  const [markNotes, setMarkNotes] = useState('')

  useEffect(() => {
    window.electronAPI.accounts.list().then(accs => {
      setAccounts(accs)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedAccountId) { setContracts([]); setSelectedContractId(''); return }
    window.electronAPI.contracts.listByAccount(selectedAccountId).then(setContracts)
    setSelectedContractId('')
  }, [selectedAccountId])

  useEffect(() => {
    if (!selectedContractId) { setAllSites([]); setSelectedSiteId(''); return }
    window.electronAPI.sites.listByContract(selectedContractId).then(setAllSites)
    setSelectedSiteId('')
  }, [selectedContractId])

  const loadMatrix = useCallback(async () => {
    if (!selectedSiteId) {
      setEmployees([])
      setCourses([])
      setMatrix({})
      return
    }
    setMatrixLoading(true)
    try {
      const [emps, crsList] = await Promise.all([
        window.electronAPI.employees.listWithAttributes([selectedSiteId]),
        window.electronAPI.courses.list(),
      ])
      setEmployees(emps)
      setCourses(crsList)

      if (emps.length === 0 || crsList.length === 0) {
        setMatrix({})
        setMatrixLoading(false)
        return
      }

      const empIds = emps.map(e => e.id)
      const [requirements, records] = await Promise.all([
        window.electronAPI.courseRequirements.listByEmployees(empIds),
        window.electronAPI.trainingRecords.listByEmployees(empIds),
      ])

      // Build lookup maps
      const reqMap = new Map<string, EmployeeCourseRequirement>()
      for (const r of requirements) {
        reqMap.set(`${r.employee_id}:${r.course_id}`, r)
      }
      const recMap = new Map<string, TrainingRecord>()
      for (const r of records) {
        recMap.set(`${r.employee_id}:${r.course_id}`, r)
      }

      // Build matrix
      const m: Record<string, Record<string, MatrixCell>> = {}
      for (const emp of emps) {
        m[emp.id] = {}
        for (const course of crsList) {
          const key = `${emp.id}:${course.id}`
          const req = reqMap.get(key)
          const rec = recMap.get(key)
          m[emp.id][course.id] = {
            status: getCellStatus(req, rec),
            record: rec,
            requirement: req,
          }
        }
      }
      setMatrix(m)
    } catch (err) {
      console.error('Failed to load matrix:', err)
    } finally {
      setMatrixLoading(false)
    }
  }, [selectedSiteId])

  useEffect(() => { loadMatrix() }, [loadMatrix])

  const openMarkComplete = (employeeId: string, courseId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    const course = courses.find(c => c.id === courseId)
    if (!emp || !course) return
    setMarkDialog({ employeeId, courseId, employeeName: emp.name, courseName: course.name })
    setCompletedDate(new Date().toISOString().split('T')[0])
    setMarkNotes('')
  }

  const handleMarkComplete = async () => {
    if (!markDialog || !completedDate) return
    const course = courses.find(c => c.id === markDialog.courseId)
    let expiresAt: string | undefined
    if (course?.valid_for_months) {
      const d = new Date(completedDate)
      d.setMonth(d.getMonth() + course.valid_for_months)
      expiresAt = d.toISOString()
    }

    // Ensure requirement exists
    await window.electronAPI.courseRequirements.upsert({
      employee_id: markDialog.employeeId,
      course_id: markDialog.courseId,
      source: 'MANUAL',
    })

    await window.electronAPI.trainingRecords.upsert({
      employee_id: markDialog.employeeId,
      course_id: markDialog.courseId,
      completed_at: new Date(completedDate).toISOString(),
      expires_at: expiresAt,
      notes: markNotes || undefined,
    })

    setMarkDialog(null)
    await loadMatrix()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Employee training compliance matrix</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Account</Label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Contract</Label>
          <Select value={selectedContractId} onValueChange={setSelectedContractId} disabled={!selectedAccountId}>
            <SelectTrigger><SelectValue placeholder="Select contract..." /></SelectTrigger>
            <SelectContent>
              {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Site</Label>
          <Select value={selectedSiteId} onValueChange={setSelectedSiteId} disabled={!selectedContractId}>
            <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
            <SelectContent>
              {allSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {Object.entries(statusConfig).map(([key, { icon: Icon, color, label }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${color.split(' ')[0]}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Matrix */}
      {!selectedSiteId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select an account, contract, and site to view the training matrix.
          </CardContent>
        </Card>
      ) : matrixLoading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">Loading matrix...</div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No employees at this site.
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses created yet.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 min-w-[160px]">Employee</TableHead>
                {courses.map(course => (
                  <TableHead key={course.id} className="text-center min-w-[100px]">
                    <div className="text-xs leading-tight">{course.name}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">{emp.name}</TableCell>
                  {courses.map(course => {
                    const cell = matrix[emp.id]?.[course.id]
                    if (!cell) return <TableCell key={course.id} />
                    const { icon: Icon, color } = statusConfig[cell.status]
                    return (
                      <TableCell key={course.id} className="text-center p-1">
                        <button
                          onClick={() => openMarkComplete(emp.id, course.id)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded ${color} hover:ring-2 hover:ring-ring transition-all`}
                          title={`${statusConfig[cell.status].label} — click to update`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Mark Complete Dialog */}
      <Dialog open={!!markDialog} onOpenChange={(open) => !open && setMarkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Training Completion</DialogTitle>
          </DialogHeader>
          {markDialog && (
            <div className="space-y-4 py-2">
              <div className="text-sm">
                <span className="font-medium">{markDialog.employeeName}</span>
                <span className="text-muted-foreground"> — </span>
                <span>{markDialog.courseName}</span>
              </div>
              <div className="space-y-2">
                <Label>Completion Date</Label>
                <Input type="date" value={completedDate} onChange={e => setCompletedDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={markNotes} onChange={e => setMarkNotes(e.target.value)} placeholder="Optional notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkDialog(null)}>Cancel</Button>
            <Button onClick={handleMarkComplete} disabled={!completedDate}>Mark Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
