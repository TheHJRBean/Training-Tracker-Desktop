import Database from 'better-sqlite3'
import crypto from 'crypto'

interface CourseRow {
  id: string
  name: string
  description: string | null
  category: string | null
  account_id: string | null
  valid_for_months: number | null
  completion_window_days: number | null
  created_at: string
  updated_at: string
}

export class CourseRepository {
  constructor(private db: Database.Database) {}

  list(accountId?: string): CourseRow[] {
    if (accountId) {
      return this.db.prepare(
        'SELECT * FROM courses WHERE account_id = ? OR account_id IS NULL ORDER BY name'
      ).all(accountId) as CourseRow[]
    }
    return this.db.prepare('SELECT * FROM courses ORDER BY name').all() as CourseRow[]
  }

  getById(id: string): CourseRow | undefined {
    return this.db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as CourseRow | undefined
  }

  create(data: {
    name: string
    description?: string
    category?: string
    account_id?: string
    valid_for_months?: number
    completion_window_days?: number
  }): CourseRow {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      `INSERT INTO courses (id, name, description, category, account_id, valid_for_months, completion_window_days, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, data.name, data.description ?? null, data.category ?? null,
      data.account_id ?? null, data.valid_for_months ?? null,
      data.completion_window_days ?? null, now, now
    )
    return this.getById(id)!
  }

  update(id: string, data: {
    name?: string
    description?: string | null
    category?: string | null
    valid_for_months?: number | null
    completion_window_days?: number | null
  }): CourseRow {
    const current = this.getById(id)
    if (!current) throw new Error(`Course ${id} not found`)
    const now = new Date().toISOString()
    this.db.prepare(
      `UPDATE courses SET name = ?, description = ?, category = ?, valid_for_months = ?, completion_window_days = ?, updated_at = ? WHERE id = ?`
    ).run(
      data.name ?? current.name,
      data.description !== undefined ? data.description : current.description,
      data.category !== undefined ? data.category : current.category,
      data.valid_for_months !== undefined ? data.valid_for_months : current.valid_for_months,
      data.completion_window_days !== undefined ? data.completion_window_days : current.completion_window_days,
      now, id
    )
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM courses WHERE id = ?').run(id)
  }
}
