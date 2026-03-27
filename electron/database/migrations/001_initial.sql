PRAGMA foreign_keys = ON;

-- === ORGANIZATIONAL HIERARCHY ===

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contracts_account ON contracts(account_id);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sites_contract ON sites(contract_id);

-- === EMPLOYEES ===

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_employees_site ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

CREATE TABLE IF NOT EXISTS employee_attributes (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(employee_id, key)
);
CREATE INDEX IF NOT EXISTS idx_emp_attr_employee ON employee_attributes(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_attr_key_value ON employee_attributes(key, value);

-- === CLASS HIERARCHIES ===

CREATE TABLE IF NOT EXISTS class_hierarchies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES class_hierarchies(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_class_parent ON class_hierarchies(parent_id);
CREATE INDEX IF NOT EXISTS idx_class_account ON class_hierarchies(account_id);

CREATE TABLE IF NOT EXISTS employee_classes (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  class_hierarchy_id TEXT NOT NULL REFERENCES class_hierarchies(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(employee_id, class_hierarchy_id)
);
CREATE INDEX IF NOT EXISTS idx_emp_class_employee ON employee_classes(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_class_hierarchy ON employee_classes(class_hierarchy_id);

-- === COURSES ===

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  valid_for_months INTEGER,
  completion_window_days INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_courses_account ON courses(account_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- === COURSE ASSIGNMENT RULES ===

CREATE TABLE IF NOT EXISTS course_assignment_rules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  scope_site_id TEXT REFERENCES sites(id) ON DELETE CASCADE,
  scope_contract_id TEXT REFERENCES contracts(id) ON DELETE CASCADE,
  rule_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(course_id, scope_site_id)
);
CREATE INDEX IF NOT EXISTS idx_car_course ON course_assignment_rules(course_id);

-- === COURSE REQUIREMENTS (computed from rules or manual) ===

CREATE TABLE IF NOT EXISTS employee_course_requirements (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK(source IN ('MANUAL', 'AUTO_RULE')),
  source_rule_id TEXT REFERENCES course_assignment_rules(id) ON DELETE SET NULL,
  computed_at TEXT,
  UNIQUE(employee_id, course_id, source)
);
CREATE INDEX IF NOT EXISTS idx_ecr_employee ON employee_course_requirements(employee_id);
CREATE INDEX IF NOT EXISTS idx_ecr_course ON employee_course_requirements(course_id);

-- === TRAINING RECORDS ===

CREATE TABLE IF NOT EXISTS training_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  expires_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(employee_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_tr_employee ON training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_tr_course ON training_records(course_id);
CREATE INDEX IF NOT EXISTS idx_tr_expires ON training_records(expires_at);

-- === APP SETTINGS ===

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
