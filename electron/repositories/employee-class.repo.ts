import Database from 'better-sqlite3'
import crypto from 'crypto'

interface EmployeeClassRow {
  id: string
  employee_id: string
  class_hierarchy_id: string
  assigned_at: string
}

export class EmployeeClassRepository {
  constructor(private db: Database.Database) {}

  listByEmployee(employeeId: string): EmployeeClassRow[] {
    return this.db.prepare(
      'SELECT * FROM employee_classes WHERE employee_id = ? ORDER BY assigned_at'
    ).all(employeeId) as EmployeeClassRow[]
  }

  listByClass(classId: string): EmployeeClassRow[] {
    return this.db.prepare(
      'SELECT * FROM employee_classes WHERE class_hierarchy_id = ?'
    ).all(classId) as EmployeeClassRow[]
  }

  listByEmployees(employeeIds: string[]): EmployeeClassRow[] {
    if (employeeIds.length === 0) return []
    const placeholders = employeeIds.map(() => '?').join(',')
    return this.db.prepare(
      `SELECT * FROM employee_classes WHERE employee_id IN (${placeholders})`
    ).all(...employeeIds) as EmployeeClassRow[]
  }

  assign(employeeId: string, classHierarchyId: string): EmployeeClassRow {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      'INSERT OR IGNORE INTO employee_classes (id, employee_id, class_hierarchy_id, assigned_at) VALUES (?, ?, ?, ?)'
    ).run(id, employeeId, classHierarchyId, now)
    return this.db.prepare(
      'SELECT * FROM employee_classes WHERE employee_id = ? AND class_hierarchy_id = ?'
    ).get(employeeId, classHierarchyId) as EmployeeClassRow
  }

  unassign(employeeId: string, classHierarchyId: string): void {
    this.db.prepare(
      'DELETE FROM employee_classes WHERE employee_id = ? AND class_hierarchy_id = ?'
    ).run(employeeId, classHierarchyId)
  }
}
