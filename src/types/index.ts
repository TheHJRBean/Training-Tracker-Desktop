// === Organizational Hierarchy ===

export interface Account {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  account_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  contract_id: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// === Employees ===

export interface Employee {
  id: string
  site_id: string
  name: string
  email: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeAttribute {
  id: string
  employee_id: string
  key: string
  value: string
}

export interface EmployeeWithAttributes extends Employee {
  attributes: Record<string, string>
}

export interface EmployeeDetail extends EmployeeWithAttributes {
  classIds: string[]
  classes: ClassHierarchy[]
  site?: Site
}

// === Class Hierarchies ===

export interface ClassHierarchy {
  id: string
  name: string
  account_id: string | null
  parent_id: string | null
  level: number
  created_at: string
  updated_at: string
}

export interface ClassHierarchyNode extends ClassHierarchy {
  children: ClassHierarchyNode[]
}

export interface EmployeeClass {
  id: string
  employee_id: string
  class_hierarchy_id: string
  assigned_at: string
}

// === Courses ===

export interface Course {
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

export interface CourseDetail extends Course {
  rules: CourseAssignmentRule[]
}

// === Course Assignment Rules ===

export interface CourseAssignmentRule {
  id: string
  course_id: string
  scope_site_id: string | null
  scope_contract_id: string | null
  rule_json: string
  created_at: string
  updated_at: string
}

// === Course Requirements ===

export type RequirementSource = 'MANUAL' | 'AUTO_RULE'

export interface EmployeeCourseRequirement {
  id: string
  employee_id: string
  course_id: string
  source: RequirementSource
  source_rule_id: string | null
  computed_at: string | null
}

// === Training Records ===

export interface TrainingRecord {
  id: string
  employee_id: string
  course_id: string
  completed_at: string
  expires_at: string | null
  notes: string | null
  created_at: string
}

// === Training Matrix ===

export type CellStatus = 'COMPLETED' | 'EXPIRED' | 'EXPIRING_SOON' | 'NOT_STARTED' | 'NOT_REQUIRED'

export interface MatrixCell {
  employeeId: string
  courseId: string
  status: CellStatus
  requirementSource: RequirementSource | 'BOTH' | null
  completedAt: string | null
  expiresAt: string | null
}

export interface TrainingMatrixData {
  employees: EmployeeWithAttributes[]
  courses: Course[]
  cells: Record<string, Record<string, MatrixCell>> // employeeId -> courseId -> cell
}

export interface ComputeResult {
  created: number
  removed: number
  unchanged: number
}

// === DTOs ===

export interface CreateAccountDto {
  name: string
  description?: string
}

export interface UpdateAccountDto {
  name?: string
  description?: string | null
}

export interface CreateContractDto {
  account_id: string
  name: string
  description?: string
}

export interface UpdateContractDto {
  name?: string
  description?: string | null
  is_active?: boolean
}

export interface CreateSiteDto {
  contract_id: string
  name: string
  location?: string
}

export interface UpdateSiteDto {
  name?: string
  location?: string | null
  is_active?: boolean
}

export interface CreateEmployeeDto {
  site_id: string
  name: string
  email?: string
  attributes?: Record<string, string>
}

export interface UpdateEmployeeDto {
  name?: string
  email?: string | null
  site_id?: string
}

export interface CreateCourseDto {
  name: string
  description?: string
  category?: string
  account_id?: string
  valid_for_months?: number
  completion_window_days?: number
}

export interface UpdateCourseDto {
  name?: string
  description?: string | null
  category?: string | null
  valid_for_months?: number | null
  completion_window_days?: number | null
}

export interface CreateClassDto {
  name: string
  account_id: string
  parent_id?: string
}

export interface UpdateClassDto {
  name?: string
  parent_id?: string | null
}

export interface MarkCompleteDto {
  employee_id: string
  course_id: string
  completed_at: string
  notes?: string
}
