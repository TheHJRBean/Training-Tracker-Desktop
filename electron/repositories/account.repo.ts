import Database from 'better-sqlite3'
import crypto from 'crypto'

interface AccountRow {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export class AccountRepository {
  constructor(private db: Database.Database) {}

  list(): AccountRow[] {
    return this.db.prepare('SELECT * FROM accounts ORDER BY name').all() as AccountRow[]
  }

  getById(id: string): AccountRow | undefined {
    return this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as AccountRow | undefined
  }

  create(data: { name: string; description?: string }): AccountRow {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      'INSERT INTO accounts (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, data.name, data.description ?? null, now, now)
    return this.getById(id)!
  }

  update(id: string, data: { name?: string; description?: string | null }): AccountRow {
    const current = this.getById(id)
    if (!current) throw new Error(`Account ${id} not found`)
    const now = new Date().toISOString()
    this.db.prepare(
      'UPDATE accounts SET name = ?, description = ?, updated_at = ? WHERE id = ?'
    ).run(data.name ?? current.name, data.description !== undefined ? data.description : current.description, now, id)
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM accounts WHERE id = ?').run(id)
  }
}
