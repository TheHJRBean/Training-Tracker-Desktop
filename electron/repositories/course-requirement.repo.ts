import Database from 'better-sqlite3'
import crypto from 'crypto'

interface RequirementRow {
  id: string
  employee_id: string
  course_id: string
  source: 'MANUAL' | 'AUTO_RULE'
  source_rule_id: string | null
  computed_at: string | null
}

export class CourseRequirementRepository {
  constructor(private db: Database.Database) {}

  listByEmployee(employeeId: string): RequirementRow[] {
    return this.db.prepare(
      'SELECT * FROM employee_course_requirements WHERE employee_id = ?'
    ).all(employeeId) as RequirementRow[]
  }

  listByCourse(courseId: string): RequirementRow[] {
    return this.db.prepare(
      'SELECT * FROM employee_course_requirements WHERE course_id = ?'
    ).all(courseId) as RequirementRow[]
  }

  listByEmployees(employeeIds: string[]): RequirementRow[] {
    if (employeeIds.length === 0) return []
    const placeholders = employeeIds.map(() => '?').join(',')
    return this.db.prepare(
      `SELECT * FROM employee_course_requirements WHERE employee_id IN (${placeholders})`
    ).all(...employeeIds) as RequirementRow[]
  }

  upsert(data: {
    employee_id: string
    course_id: string
    source: 'MANUAL' | 'AUTO_RULE'
    source_rule_id?: string | null
  }): RequirementRow {
    const now = new Date().toISOString()
    const existing = this.db.prepare(
      'SELECT * FROM employee_course_requirements WHERE employee_id = ? AND course_id = ? AND source = ?'
    ).get(data.employee_id, data.course_id, data.source) as RequirementRow | undefined

    if (existing) {
      this.db.prepare(
        'UPDATE employee_course_requirements SET source_rule_id = ?, computed_at = ? WHERE id = ?'
      ).run(data.source_rule_id ?? null, now, existing.id)
      return this.db.prepare('SELECT * FROM employee_course_requirements WHERE id = ?').get(existing.id) as RequirementRow
    }

    const id = crypto.randomUUID()
    this.db.prepare(
      'INSERT INTO employee_course_requirements (id, employee_id, course_id, source, source_rule_id, computed_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, data.employee_id, data.course_id, data.source, data.source_rule_id ?? null, now)
    return this.db.prepare('SELECT * FROM employee_course_requirements WHERE id = ?').get(id) as RequirementRow
  }

  deleteAutoRuleByRuleId(ruleId: string): number {
    const result = this.db.prepare(
      "DELETE FROM employee_course_requirements WHERE source = 'AUTO_RULE' AND source_rule_id = ?"
    ).run(ruleId)
    return result.changes
  }

  deleteAutoRuleForEmployeeCourse(employeeId: string, courseId: string): void {
    this.db.prepare(
      "DELETE FROM employee_course_requirements WHERE employee_id = ? AND course_id = ? AND source = 'AUTO_RULE'"
    ).run(employeeId, courseId)
  }

  deleteManual(employeeId: string, courseId: string): void {
    this.db.prepare(
      "DELETE FROM employee_course_requirements WHERE employee_id = ? AND course_id = ? AND source = 'MANUAL'"
    ).run(employeeId, courseId)
  }
}
