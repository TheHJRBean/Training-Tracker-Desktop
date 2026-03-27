import Database from 'better-sqlite3'
import crypto from 'crypto'

interface EmployeeRow {
  id: string
  site_id: string
  name: string
  email: string | null
  created_at: string
  updated_at: string
}

interface AttributeRow {
  id: string
  employee_id: string
  key: string
  value: string
}

export class EmployeeRepository {
  constructor(private db: Database.Database) {}

  listBySite(siteId: string): EmployeeRow[] {
    return this.db.prepare('SELECT * FROM employees WHERE site_id = ? ORDER BY name').all(siteId) as EmployeeRow[]
  }

  listBySites(siteIds: string[]) {
    if (siteIds.length === 0) return []
    const placeholders = siteIds.map(() => '?').join(',')
    return this.db.prepare(`SELECT * FROM employees WHERE site_id IN (${placeholders}) ORDER BY name`).all(...siteIds) as EmployeeRow[]
  }

  getById(id: string): EmployeeRow | undefined {
    return this.db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as EmployeeRow | undefined
  }

  getWithAttributes(id: string) {
    const employee = this.getById(id)
    if (!employee) return undefined
    const attrs = this.db.prepare('SELECT key, value FROM employee_attributes WHERE employee_id = ?').all(id) as { key: string; value: string }[]
    const attributes: Record<string, string> = {}
    for (const a of attrs) attributes[a.key] = a.value
    return { ...employee, attributes }
  }

  listWithAttributes(siteIds: string[]) {
    const employees = siteIds.length === 1
      ? this.listBySite(siteIds[0])
      : this.listBySites(siteIds)

    const empIds = employees.map(e => e.id)
    if (empIds.length === 0) return []

    const placeholders = empIds.map(() => '?').join(',')
    const allAttrs = this.db.prepare(
      `SELECT employee_id, key, value FROM employee_attributes WHERE employee_id IN (${placeholders})`
    ).all(...empIds) as { employee_id: string; key: string; value: string }[]

    const attrMap = new Map<string, Record<string, string>>()
    for (const a of allAttrs) {
      if (!attrMap.has(a.employee_id)) attrMap.set(a.employee_id, {})
      attrMap.get(a.employee_id)![a.key] = a.value
    }

    return employees.map(e => ({
      ...e,
      attributes: attrMap.get(e.id) ?? {}
    }))
  }

  create(data: { site_id: string; name: string; email?: string; attributes?: Record<string, string> }) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const insertEmployee = this.db.prepare(
      'INSERT INTO employees (id, site_id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const insertAttr = this.db.prepare(
      'INSERT INTO employee_attributes (id, employee_id, key, value) VALUES (?, ?, ?, ?)'
    )

    const run = this.db.transaction(() => {
      insertEmployee.run(id, data.site_id, data.name, data.email ?? null, now, now)
      if (data.attributes) {
        for (const [key, value] of Object.entries(data.attributes)) {
          insertAttr.run(crypto.randomUUID(), id, key, value)
        }
      }
    })
    run()

    return this.getById(id)!
  }

  update(id: string, data: { name?: string; email?: string | null; site_id?: string }) {
    const current = this.getById(id)
    if (!current) throw new Error(`Employee ${id} not found`)
    const now = new Date().toISOString()
    this.db.prepare(
      'UPDATE employees SET name = ?, email = ?, site_id = ?, updated_at = ? WHERE id = ?'
    ).run(
      data.name ?? current.name,
      data.email !== undefined ? data.email : current.email,
      data.site_id ?? current.site_id,
      now, id
    )
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM employees WHERE id = ?').run(id)
  }

  setAttribute(employeeId: string, key: string, value: string): void {
    const existing = this.db.prepare(
      'SELECT id FROM employee_attributes WHERE employee_id = ? AND key = ?'
    ).get(employeeId, key) as { id: string } | undefined

    if (existing) {
      this.db.prepare('UPDATE employee_attributes SET value = ? WHERE id = ?').run(value, existing.id)
    } else {
      this.db.prepare(
        'INSERT INTO employee_attributes (id, employee_id, key, value) VALUES (?, ?, ?, ?)'
      ).run(crypto.randomUUID(), employeeId, key, value)
    }
  }

  removeAttribute(employeeId: string, key: string): void {
    this.db.prepare('DELETE FROM employee_attributes WHERE employee_id = ? AND key = ?').run(employeeId, key)
  }

  getDistinctAttributeKeys(): string[] {
    const rows = this.db.prepare('SELECT DISTINCT key FROM employee_attributes ORDER BY key').all() as { key: string }[]
    return rows.map(r => r.key)
  }
}
