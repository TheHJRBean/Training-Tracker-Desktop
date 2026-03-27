import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

export function runMigrations(db: Database.Database): void {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const migrationsDir = path.join(__dirname, 'migrations')

  // In dev mode, migrations are in electron/database/migrations
  // In prod, they're in dist-electron/database/migrations
  let sqlFiles: string[] = []
  const dirs = [
    migrationsDir,
    path.join(__dirname, '..', 'electron', 'database', 'migrations'),
  ]

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      sqlFiles = fs.readdirSync(dir)
        .filter(f => f.endsWith('.sql'))
        .sort()
        .map(f => path.join(dir, f))
      if (sqlFiles.length > 0) break
    }
  }

  const applied = new Set(
    (db.prepare('SELECT name FROM _migrations').all() as { name: string }[])
      .map(r => r.name)
  )

  for (const filePath of sqlFiles) {
    const name = path.basename(filePath)
    if (applied.has(name)) continue

    const sql = fs.readFileSync(filePath, 'utf-8')
    db.exec(sql)
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(name)
    console.log(`Applied migration: ${name}`)
  }
}
