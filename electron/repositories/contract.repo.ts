import Database from 'better-sqlite3'
import crypto from 'crypto'

interface ContractRow {
  id: string
  account_id: string
  name: string
  description: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export class ContractRepository {
  constructor(private db: Database.Database) {}

  private toContract(row: ContractRow) {
    return { ...row, is_active: !!row.is_active }
  }

  listByAccount(accountId: string) {
    const rows = this.db.prepare('SELECT * FROM contracts WHERE account_id = ? ORDER BY name').all(accountId) as ContractRow[]
    return rows.map(r => this.toContract(r))
  }

  getById(id: string) {
    const row = this.db.prepare('SELECT * FROM contracts WHERE id = ?').get(id) as ContractRow | undefined
    return row ? this.toContract(row) : undefined
  }

  create(data: { account_id: string; name: string; description?: string }) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      'INSERT INTO contracts (id, account_id, name, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)'
    ).run(id, data.account_id, data.name, data.description ?? null, now, now)
    return this.getById(id)!
  }

  update(id: string, data: { name?: string; description?: string | null; is_active?: boolean }) {
    const current = this.getById(id)
    if (!current) throw new Error(`Contract ${id} not found`)
    const now = new Date().toISOString()
    this.db.prepare(
      'UPDATE contracts SET name = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?'
    ).run(
      data.name ?? current.name,
      data.description !== undefined ? data.description : current.description,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : (current.is_active ? 1 : 0),
      now, id
    )
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM contracts WHERE id = ?').run(id)
  }
}
