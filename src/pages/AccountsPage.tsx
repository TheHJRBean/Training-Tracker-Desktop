import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Building2, MapPin } from 'lucide-react'
import type { Account, Contract, Site } from '@/types'

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [contracts, setContracts] = useState<Record<string, Contract[]>>({})
  const [sites, setSites] = useState<Record<string, Site[]>>({})
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialog, setDialog] = useState<{
    type: 'account' | 'contract' | 'site'
    mode: 'create' | 'edit'
    parentId?: string
    item?: any
  } | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formLocation, setFormLocation] = useState('')

  const loadAccounts = useCallback(async () => {
    const accs = await window.electronAPI.accounts.list()
    setAccounts(accs)
    setLoading(false)
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const toggleExpand = async (accountId: string) => {
    const isExpanding = !expanded[accountId]
    setExpanded(prev => ({ ...prev, [accountId]: isExpanding }))
    if (isExpanding && !contracts[accountId]) {
      const ctrs = await window.electronAPI.contracts.listByAccount(accountId)
      setContracts(prev => ({ ...prev, [accountId]: ctrs }))
    }
  }

  const loadContractSites = async (contractId: string) => {
    if (!sites[contractId]) {
      const s = await window.electronAPI.sites.listByContract(contractId)
      setSites(prev => ({ ...prev, [contractId]: s }))
    }
  }

  const [expandedContracts, setExpandedContracts] = useState<Record<string, boolean>>({})
  const toggleContractExpand = async (contractId: string) => {
    const isExpanding = !expandedContracts[contractId]
    setExpandedContracts(prev => ({ ...prev, [contractId]: isExpanding }))
    if (isExpanding) await loadContractSites(contractId)
  }

  const openDialog = (type: 'account' | 'contract' | 'site', mode: 'create' | 'edit', parentId?: string, item?: any) => {
    setDialog({ type, mode, parentId, item })
    setFormName(item?.name ?? '')
    setFormDesc(item?.description ?? '')
    setFormLocation(item?.location ?? '')
  }

  const handleSave = async () => {
    if (!dialog || !formName.trim()) return
    const { type, mode, parentId, item } = dialog

    if (type === 'account') {
      if (mode === 'create') {
        await window.electronAPI.accounts.create({ name: formName, description: formDesc || undefined })
      } else {
        await window.electronAPI.accounts.update(item.id, { name: formName, description: formDesc || null })
      }
      await loadAccounts()
    } else if (type === 'contract') {
      if (mode === 'create') {
        await window.electronAPI.contracts.create({ account_id: parentId!, name: formName, description: formDesc || undefined })
      } else {
        await window.electronAPI.contracts.update(item.id, { name: formName, description: formDesc || null })
      }
      const accountId = mode === 'create' ? parentId! : item.account_id
      const ctrs = await window.electronAPI.contracts.listByAccount(accountId)
      setContracts(prev => ({ ...prev, [accountId]: ctrs }))
    } else if (type === 'site') {
      if (mode === 'create') {
        await window.electronAPI.sites.create({ contract_id: parentId!, name: formName, location: formLocation || undefined })
      } else {
        await window.electronAPI.sites.update(item.id, { name: formName, location: formLocation || null })
      }
      const contractId = mode === 'create' ? parentId! : item.contract_id
      const s = await window.electronAPI.sites.listByContract(contractId)
      setSites(prev => ({ ...prev, [contractId]: s }))
    }
    setDialog(null)
  }

  const handleDelete = async (type: 'account' | 'contract' | 'site', id: string, parentId?: string) => {
    if (type === 'account') {
      await window.electronAPI.accounts.delete(id)
      await loadAccounts()
    } else if (type === 'contract') {
      await window.electronAPI.contracts.delete(id)
      if (parentId) {
        const ctrs = await window.electronAPI.contracts.listByAccount(parentId)
        setContracts(prev => ({ ...prev, [parentId]: ctrs }))
      }
    } else if (type === 'site') {
      await window.electronAPI.sites.delete(id)
      if (parentId) {
        const s = await window.electronAPI.sites.listByContract(parentId)
        setSites(prev => ({ ...prev, [parentId]: s }))
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage accounts, contracts, and sites</p>
        </div>
        <Button onClick={() => openDialog('account', 'create')} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No accounts yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleExpand(account.id)} className="p-0.5 hover:bg-muted rounded">
                    {expanded[account.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <Building2 className="h-4 w-4 text-brand-azureBlue" />
                  <CardTitle className="text-base flex-1">{account.name}</CardTitle>
                  {account.description && (
                    <span className="text-xs text-muted-foreground hidden md:inline">{account.description}</span>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDialog('contract', 'create', account.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDialog('account', 'edit', undefined, account)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete('account', account.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expanded[account.id] && (
                <CardContent className="pt-0 pb-3 px-4">
                  {!contracts[account.id] ? (
                    <div className="text-sm text-muted-foreground pl-8">Loading...</div>
                  ) : contracts[account.id].length === 0 ? (
                    <div className="text-sm text-muted-foreground pl-8">No contracts</div>
                  ) : (
                    <div className="space-y-1 pl-6 border-l-2 border-muted ml-2">
                      {contracts[account.id].map(contract => (
                        <div key={contract.id}>
                          <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50">
                            <button onClick={() => toggleContractExpand(contract.id)} className="p-0.5 hover:bg-muted rounded">
                              {expandedContracts[contract.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                            <span className="text-sm font-medium flex-1">{contract.name}</span>
                            <Badge variant={contract.is_active ? 'secondary' : 'outline'} className="text-xs">
                              {contract.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex gap-0.5">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openDialog('site', 'create', contract.id)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openDialog('contract', 'edit', account.id, contract)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete('contract', contract.id, account.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {expandedContracts[contract.id] && (
                            <div className="pl-8 space-y-0.5">
                              {!sites[contract.id] ? (
                                <div className="text-xs text-muted-foreground py-1">Loading...</div>
                              ) : sites[contract.id].length === 0 ? (
                                <div className="text-xs text-muted-foreground py-1">No sites</div>
                              ) : (
                                sites[contract.id].map(site => (
                                  <div key={site.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/30 text-sm">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="flex-1">{site.name}</span>
                                    {site.location && <span className="text-xs text-muted-foreground">{site.location}</span>}
                                    <Badge variant={site.is_active ? 'secondary' : 'outline'} className="text-xs">
                                      {site.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <div className="flex gap-0.5">
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => openDialog('site', 'edit', contract.id, site)}>
                                        <Pencil className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete('site', site.id, contract.id)}>
                                        <Trash2 className="h-2.5 w-2.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'create' ? 'Create' : 'Edit'} {dialog?.type}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Enter name..." autoFocus />
            </div>
            {dialog?.type !== 'site' ? (
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Optional location..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {dialog?.mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
