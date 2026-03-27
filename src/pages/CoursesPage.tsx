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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { Course } from '@/types'

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Dialog
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; course?: Course } | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formValidity, setFormValidity] = useState('')
  const [formWindow, setFormWindow] = useState('')

  const loadCourses = useCallback(async () => {
    const data = await window.electronAPI.courses.list()
    setCourses(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadCourses() }, [loadCourses])

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
  )

  const openCreate = () => {
    setDialog({ mode: 'create' })
    setFormName('')
    setFormDesc('')
    setFormCategory('')
    setFormValidity('')
    setFormWindow('')
  }

  const openEdit = (course: Course) => {
    setDialog({ mode: 'edit', course })
    setFormName(course.name)
    setFormDesc(course.description ?? '')
    setFormCategory(course.category ?? '')
    setFormValidity(course.valid_for_months?.toString() ?? '')
    setFormWindow(course.completion_window_days?.toString() ?? '')
  }

  const handleSave = async () => {
    if (!formName.trim() || !dialog) return
    const validForMonths = formValidity ? parseInt(formValidity) : undefined
    const completionWindowDays = formWindow ? parseInt(formWindow) : undefined

    if (dialog.mode === 'create') {
      await window.electronAPI.courses.create({
        name: formName,
        description: formDesc || undefined,
        category: formCategory || undefined,
        valid_for_months: validForMonths,
        completion_window_days: completionWindowDays,
      })
    } else {
      await window.electronAPI.courses.update(dialog.course!.id, {
        name: formName,
        description: formDesc || null,
        category: formCategory || null,
        valid_for_months: validForMonths ?? null,
        completion_window_days: completionWindowDays ?? null,
      })
    }
    setDialog(null)
    await loadCourses()
  }

  const handleDelete = async (id: string) => {
    await window.electronAPI.courses.delete(id)
    await loadCourses()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage training courses</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? 'No matching courses.' : 'No courses yet. Create one to get started.'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Valid For</TableHead>
                <TableHead>Completion Window</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(course => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.name}</div>
                      {course.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{course.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.category ? (
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {course.valid_for_months ? `${course.valid_for_months} months` : '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {course.completion_window_days ? `${course.completion_window_days} days` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(course)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)}>
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
            <DialogTitle>{dialog?.mode === 'create' ? 'Add' : 'Edit'} Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Course name..." autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description..." />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Safety, Compliance..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid For (months)</Label>
                <Input type="number" min="1" value={formValidity} onChange={e => setFormValidity(e.target.value)} placeholder="e.g. 12" />
              </div>
              <div className="space-y-2">
                <Label>Completion Window (days)</Label>
                <Input type="number" min="1" value={formWindow} onChange={e => setFormWindow(e.target.value)} placeholder="e.g. 30" />
              </div>
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
