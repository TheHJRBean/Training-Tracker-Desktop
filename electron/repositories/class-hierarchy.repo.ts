import Database from 'better-sqlite3'
import crypto from 'crypto'

interface ClassHierarchyRow {
  id: string
  name: string
  account_id: string | null
  parent_id: string | null
  level: number
  created_at: string
  updated_at: string
}

export class ClassHierarchyRepository {
  constructor(private db: Database.Database) {}

  listByAccount(accountId: string): ClassHierarchyRow[] {
    return this.db.prepare(
      'SELECT * FROM class_hierarchies WHERE account_id = ? OR account_id IS NULL ORDER BY level, name'
    ).all(accountId) as ClassHierarchyRow[]
  }

  getById(id: string): ClassHierarchyRow | undefined {
    return this.db.prepare('SELECT * FROM class_hierarchies WHERE id = ?').get(id) as ClassHierarchyRow | undefined
  }

  getDescendantIds(id: string): string[] {
    // Recursive CTE to get all descendants
    const rows = this.db.prepare(`
      WITH RECURSIVE descendants AS (
        SELECT id FROM class_hierarchies WHERE parent_id = ?
        UNION ALL
        SELECT ch.id FROM class_hierarchies ch
        JOIN descendants d ON ch.parent_id = d.id
      )
      SELECT id FROM descendants
    `).all(id) as { id: string }[]
    return rows.map(r => r.id)
  }

  create(data: { name: string; account_id: string; parent_id?: string }): ClassHierarchyRow {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    let level = 0
    if (data.parent_id) {
      const parent = this.getById(data.parent_id)
      if (parent) level = parent.level + 1
    }
    this.db.prepare(
      'INSERT INTO class_hierarchies (id, name, account_id, parent_id, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, data.name, data.account_id, data.parent_id ?? null, level, now, now)
    return this.getById(id)!
  }

  update(id: string, data: { name?: string; parent_id?: string | null }): ClassHierarchyRow {
    const current = this.getById(id)
    if (!current) throw new Error(`ClassHierarchy ${id} not found`)
    const now = new Date().toISOString()

    let level = current.level
    if (data.parent_id !== undefined) {
      if (data.parent_id === null) {
        level = 0
      } else {
        const parent = this.getById(data.parent_id)
        level = parent ? parent.level + 1 : 0
      }
    }

    this.db.prepare(
      'UPDATE class_hierarchies SET name = ?, parent_id = ?, level = ?, updated_at = ? WHERE id = ?'
    ).run(
      data.name ?? current.name,
      data.parent_id !== undefined ? data.parent_id : current.parent_id,
      level, now, id
    )
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM class_hierarchies WHERE id = ?').run(id)
  }
}
