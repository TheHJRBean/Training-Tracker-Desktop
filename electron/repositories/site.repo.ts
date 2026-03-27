import Database from 'better-sqlite3'
import crypto from 'crypto'

interface SiteRow {
  id: string
  contract_id: string
  name: string
  location: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export class SiteRepository {
  constructor(private db: Database.Database) {}

  private toSite(row: SiteRow) {
    return { ...row, is_active: !!row.is_active }
  }

  listByContract(contractId: string) {
    const rows = this.db.prepare('SELECT * FROM sites WHERE contract_id = ? ORDER BY name').all(contractId) as SiteRow[]
    return rows.map(r => this.toSite(r))
  }

  getById(id: string) {
    const row = this.db.prepare('SELECT * FROM sites WHERE id = ?').get(id) as SiteRow | undefined
    return row ? this.toSite(row) : undefined
  }

  create(data: { contract_id: string; name: string; location?: string }) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      'INSERT INTO sites (id, contract_id, name, location, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)'
    ).run(id, data.contract_id, data.name, data.location ?? null, now, now)
    return this.getById(id)!
  }

  update(id: string, data: { name?: string; location?: string | null; is_active?: boolean }) {
    const current = this.getById(id)
    if (!current) throw new Error(`Site ${id} not found`)
    const now = new Date().toISOString()
    this.db.prepare(
      'UPDATE sites SET name = ?, location = ?, is_active = ?, updated_at = ? WHERE id = ?'
    ).run(
      data.name ?? current.name,
      data.location !== undefined ? data.location : current.location,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : (current.is_active ? 1 : 0),
      now, id
    )
    return this.getById(id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM sites WHERE id = ?').run(id)
  }
}
