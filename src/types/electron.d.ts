import type {
  Account, Contract, Site,
  Employee, EmployeeWithAttributes,
  EmployeeClass, ClassHierarchy,
  Course, EmployeeCourseRequirement, TrainingRecord,
  CreateAccountDto, UpdateAccountDto,
  CreateContractDto, UpdateContractDto,
  CreateSiteDto, UpdateSiteDto,
  CreateEmployeeDto, UpdateEmployeeDto,
  CreateCourseDto, UpdateCourseDto,
  CreateClassDto, UpdateClassDto,
  RequirementSource,
} from './index'

interface ElectronAPI {
  accounts: {
    list(): Promise<Account[]>
    getById(id: string): Promise<Account | undefined>
    create(data: CreateAccountDto): Promise<Account>
    update(id: string, data: UpdateAccountDto): Promise<Account>
    delete(id: string): Promise<void>
  }
  contracts: {
    listByAccount(accountId: string): Promise<Contract[]>
    getById(id: string): Promise<Contract | undefined>
    create(data: CreateContractDto): Promise<Contract>
    update(id: string, data: UpdateContractDto): Promise<Contract>
    delete(id: string): Promise<void>
  }
  sites: {
    listByContract(contractId: string): Promise<Site[]>
    getById(id: string): Promise<Site | undefined>
    create(data: CreateSiteDto): Promise<Site>
    update(id: string, data: UpdateSiteDto): Promise<Site>
    delete(id: string): Promise<void>
  }
  employees: {
    listBySite(siteId: string): Promise<Employee[]>
    getById(id: string): Promise<Employee | undefined>
    getWithAttributes(id: string): Promise<EmployeeWithAttributes | undefined>
    listWithAttributes(siteIds: string[]): Promise<EmployeeWithAttributes[]>
    create(data: CreateEmployeeDto): Promise<Employee>
    update(id: string, data: UpdateEmployeeDto): Promise<Employee>
    delete(id: string): Promise<void>
    setAttribute(employeeId: string, key: string, value: string): Promise<void>
    removeAttribute(employeeId: string, key: string): Promise<void>
    getDistinctAttributeKeys(): Promise<string[]>
  }
  employeeClasses: {
    listByEmployee(employeeId: string): Promise<EmployeeClass[]>
    listByClass(classId: string): Promise<EmployeeClass[]>
    assign(employeeId: string, classHierarchyId: string): Promise<EmployeeClass>
    unassign(employeeId: string, classHierarchyId: string): Promise<void>
  }
  classHierarchies: {
    listByAccount(accountId: string): Promise<ClassHierarchy[]>
    getById(id: string): Promise<ClassHierarchy | undefined>
    getDescendantIds(id: string): Promise<string[]>
    create(data: CreateClassDto): Promise<ClassHierarchy>
    update(id: string, data: UpdateClassDto): Promise<ClassHierarchy>
    delete(id: string): Promise<void>
  }
  courses: {
    list(accountId?: string): Promise<Course[]>
    getById(id: string): Promise<Course | undefined>
    create(data: CreateCourseDto): Promise<Course>
    update(id: string, data: UpdateCourseDto): Promise<Course>
    delete(id: string): Promise<void>
  }
  courseRequirements: {
    listByEmployee(employeeId: string): Promise<EmployeeCourseRequirement[]>
    listByCourse(courseId: string): Promise<EmployeeCourseRequirement[]>
    listByEmployees(employeeIds: string[]): Promise<EmployeeCourseRequirement[]>
    upsert(data: { employee_id: string; course_id: string; source: RequirementSource; source_rule_id?: string | null }): Promise<EmployeeCourseRequirement>
    deleteAutoRuleByRuleId(ruleId: string): Promise<number>
    deleteManual(employeeId: string, courseId: string): Promise<void>
  }
  trainingRecords: {
    listByEmployee(employeeId: string): Promise<TrainingRecord[]>
    listByCourse(courseId: string): Promise<TrainingRecord[]>
    listByEmployees(employeeIds: string[]): Promise<TrainingRecord[]>
    getByEmployeeAndCourse(employeeId: string, courseId: string): Promise<TrainingRecord | undefined>
    upsert(data: { employee_id: string; course_id: string; completed_at: string; expires_at?: string | null; notes?: string }): Promise<TrainingRecord>
    delete(id: string): Promise<void>
    getExpiringSoon(days: number): Promise<TrainingRecord[]>
    getExpired(): Promise<TrainingRecord[]>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
