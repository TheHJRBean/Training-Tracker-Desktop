import Database from 'better-sqlite3'
import crypto from 'crypto'

interface TrainingRecordRow {
  id: string
  employee_id: string
  course_id: string
  completed_at: string
  expires_at: string | null
  notes: string | null
  created_at: string
}

export class TrainingRecordRepository {
  constructor(private db: Database.Database) {}

  listByEmployee(employeeId: string): TrainingRecordRow[] {
    return this.db.prepare(
      'SELECT * FROM training_records WHERE employee_id = ? ORDER BY completed_at DESC'
    ).all(employeeId) as TrainingRecordRow[]
  }

  listByCourse(courseId: string): TrainingRecordRow[] {
    return this.db.prepare(
      'SELECT * FROM training_records WHERE course_id = ?'
    ).all(courseId) as TrainingRecordRow[]
  }

  listByEmployees(employeeIds: string[]): TrainingRecordRow[] {
    if (employeeIds.length === 0) return []
    const placeholders = employeeIds.map(() => '?').join(',')
    return this.db.prepare(
      `SELECT * FROM training_records WHERE employee_id IN (${placeholders})`
    ).all(...employeeIds) as TrainingRecordRow[]
  }

  getByEmployeeAndCourse(employeeId: string, courseId: string): TrainingRecordRow | undefined {
    return this.db.prepare(
      'SELECT * FROM training_records WHERE employee_id = ? AND course_id = ?'
    ).get(employeeId, courseId) as TrainingRecordRow | undefined
  }

  upsert(data: {
    employee_id: string
    course_id: string
    completed_at: string
    expires_at?: string | null
    notes?: string
  }): TrainingRecordRow {
    const existing = this.getByEmployeeAndCourse(data.employee_id, data.course_id)
    const now = new Date().toISOString()

    if (existing) {
      this.db.prepare(
        'UPDATE training_records SET completed_at = ?, expires_at = ?, notes = ? WHERE id = ?'
      ).run(data.completed_at, data.expires_at ?? null, data.notes ?? null, existing.id)
      return this.getByEmployeeAndCourse(data.employee_id, data.course_id)!
    }

    const id = crypto.randomUUID()
    this.db.prepare(
      'INSERT INTO training_records (id, employee_id, course_id, completed_at, expires_at, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, data.employee_id, data.course_id, data.completed_at, data.expires_at ?? null, data.notes ?? null, now)
    return this.getByEmployeeAndCourse(data.employee_id, data.course_id)!
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM training_records WHERE id = ?').run(id)
  }

  getExpiringSoon(days: number): TrainingRecordRow[] {
    return this.db.prepare(
      `SELECT * FROM training_records
       WHERE expires_at IS NOT NULL
       AND expires_at <= datetime('now', '+' || ? || ' days')
       AND expires_at >= datetime('now')
       ORDER BY expires_at`
    ).all(days) as TrainingRecordRow[]
  }

  getExpired(): TrainingRecordRow[] {
    return this.db.prepare(
      `SELECT * FROM training_records
       WHERE expires_at IS NOT NULL
       AND expires_at < datetime('now')
       ORDER BY expires_at`
    ).all() as TrainingRecordRow[]
  }
}
