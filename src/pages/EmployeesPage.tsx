import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { Account, Contract, Site, EmployeeWithAttributes } from '@/types'

export function EmployeesPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [employees, setEmployees] = useState<EmployeeWithAttributes[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Dialog
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; employee?: EmployeeWithAttributes } | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')

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
    if (!selectedContractId) { setSites([]); setSelectedSiteId(''); return }
    window.electronAPI.sites.listByContract(selectedContractId).then(setSites)
    setSelectedSiteId('')
  }, [selectedContractId])

  const loadEmployees = useCallback(async () => {
    if (!selectedSiteId) { setEmployees([]); return }
    const emps = await window.electronAPI.employees.listWithAttributes([selectedSiteId])
    setEmployees(emps)
  }, [selectedSiteId])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.email && e.email.toLowerCase().includes(search.toLowerCase()))
  )

  const openCreate = () => {
    if (!selectedSiteId) return
    setDialog({ mode: 'create' })
    setFormName('')
    setFormEmail('')
  }

  const openEdit = (emp: EmployeeWithAttributes) => {
    setDialog({ mode: 'edit', employee: emp })
    setFormName(emp.name)
    setFormEmail(emp.email ?? '')
  }

  const handleSave = async () => {
    if (!formName.trim() || !dialog) return
    if (dialog.mode === 'create') {
      await window.electronAPI.employees.create({
        site_id: selectedSiteId,
        name: formName,
        email: formEmail || undefined,
      })
    } else {
      await window.electronAPI.employees.update(dialog.employee!.id, {
        name: formName,
        email: formEmail || null,
      })
    }
    setDialog(null)
    await loadEmployees()
  }

  const handleDelete = async (id: string) => {
    await window.electronAPI.employees.delete(id)
    await loadEmployees()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employees by site</p>
        </div>
        <Button onClick={openCreate} size="sm" disabled={!selectedSiteId}>
          <Plus className="h-4 w-4 mr-1" /> Add Employee
        </Button>
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
              {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      {selectedSiteId && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      {!selectedSiteId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select an account, contract, and site to view employees.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? 'No matching employees.' : 'No employees at this site yet.'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.email ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(emp.attributes).map(([k, v]) => (
                        <span key={k} className="inline-flex text-xs bg-muted px-1.5 py-0.5 rounded">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(emp)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(emp.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === 'create' ? 'Add' : 'Edit'} Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full name..." autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@example.com" type="email" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {dialog?.mode === 'create' ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
