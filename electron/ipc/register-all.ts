import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { AccountRepository } from '../repositories/account.repo'
import { ContractRepository } from '../repositories/contract.repo'
import { SiteRepository } from '../repositories/site.repo'
import { EmployeeRepository } from '../repositories/employee.repo'
import { EmployeeClassRepository } from '../repositories/employee-class.repo'
import { ClassHierarchyRepository } from '../repositories/class-hierarchy.repo'
import { CourseRepository } from '../repositories/course.repo'
import { CourseRequirementRepository } from '../repositories/course-requirement.repo'
import { TrainingRecordRepository } from '../repositories/training-record.repo'

export function registerAllIpcHandlers(db: Database.Database): void {
  const accounts = new AccountRepository(db)
  const contracts = new ContractRepository(db)
  const sites = new SiteRepository(db)
  const employees = new EmployeeRepository(db)
  const employeeClasses = new EmployeeClassRepository(db)
  const classHierarchies = new ClassHierarchyRepository(db)
  const courses = new CourseRepository(db)
  const courseRequirements = new CourseRequirementRepository(db)
  const trainingRecords = new TrainingRecordRepository(db)

  // --- Accounts ---
  ipcMain.handle('accounts:list', () => accounts.list())
  ipcMain.handle('accounts:getById', (_, id: string) => accounts.getById(id))
  ipcMain.handle('accounts:create', (_, data) => accounts.create(data))
  ipcMain.handle('accounts:update', (_, id: string, data) => accounts.update(id, data))
  ipcMain.handle('accounts:delete', (_, id: string) => accounts.delete(id))

  // --- Contracts ---
  ipcMain.handle('contracts:listByAccount', (_, accountId: string) => contracts.listByAccount(accountId))
  ipcMain.handle('contracts:getById', (_, id: string) => contracts.getById(id))
  ipcMain.handle('contracts:create', (_, data) => contracts.create(data))
  ipcMain.handle('contracts:update', (_, id: string, data) => contracts.update(id, data))
  ipcMain.handle('contracts:delete', (_, id: string) => contracts.delete(id))

  // --- Sites ---
  ipcMain.handle('sites:listByContract', (_, contractId: string) => sites.listByContract(contractId))
  ipcMain.handle('sites:getById', (_, id: string) => sites.getById(id))
  ipcMain.handle('sites:create', (_, data) => sites.create(data))
  ipcMain.handle('sites:update', (_, id: string, data) => sites.update(id, data))
  ipcMain.handle('sites:delete', (_, id: string) => sites.delete(id))

  // --- Employees ---
  ipcMain.handle('employees:listBySite', (_, siteId: string) => employees.listBySite(siteId))
  ipcMain.handle('employees:getById', (_, id: string) => employees.getById(id))
  ipcMain.handle('employees:getWithAttributes', (_, id: string) => employees.getWithAttributes(id))
  ipcMain.handle('employees:listWithAttributes', (_, siteIds: string[]) => employees.listWithAttributes(siteIds))
  ipcMain.handle('employees:create', (_, data) => employees.create(data))
  ipcMain.handle('employees:update', (_, id: string, data) => employees.update(id, data))
  ipcMain.handle('employees:delete', (_, id: string) => employees.delete(id))
  ipcMain.handle('employees:setAttribute', (_, employeeId: string, key: string, value: string) => employees.setAttribute(employeeId, key, value))
  ipcMain.handle('employees:removeAttribute', (_, employeeId: string, key: string) => employees.removeAttribute(employeeId, key))
  ipcMain.handle('employees:getDistinctAttributeKeys', () => employees.getDistinctAttributeKeys())

  // --- Employee Classes ---
  ipcMain.handle('employee-classes:listByEmployee', (_, employeeId: string) => employeeClasses.listByEmployee(employeeId))
  ipcMain.handle('employee-classes:listByClass', (_, classId: string) => employeeClasses.listByClass(classId))
  ipcMain.handle('employee-classes:assign', (_, employeeId: string, classHierarchyId: string) => employeeClasses.assign(employeeId, classHierarchyId))
  ipcMain.handle('employee-classes:unassign', (_, employeeId: string, classHierarchyId: string) => employeeClasses.unassign(employeeId, classHierarchyId))

  // --- Class Hierarchies ---
  ipcMain.handle('class-hierarchies:listByAccount', (_, accountId: string) => classHierarchies.listByAccount(accountId))
  ipcMain.handle('class-hierarchies:getById', (_, id: string) => classHierarchies.getById(id))
  ipcMain.handle('class-hierarchies:getDescendantIds', (_, id: string) => classHierarchies.getDescendantIds(id))
  ipcMain.handle('class-hierarchies:create', (_, data) => classHierarchies.create(data))
  ipcMain.handle('class-hierarchies:update', (_, id: string, data) => classHierarchies.update(id, data))
  ipcMain.handle('class-hierarchies:delete', (_, id: string) => classHierarchies.delete(id))

  // --- Courses ---
  ipcMain.handle('courses:list', (_, accountId?: string) => courses.list(accountId))
  ipcMain.handle('courses:getById', (_, id: string) => courses.getById(id))
  ipcMain.handle('courses:create', (_, data) => courses.create(data))
  ipcMain.handle('courses:update', (_, id: string, data) => courses.update(id, data))
  ipcMain.handle('courses:delete', (_, id: string) => courses.delete(id))

  // --- Course Requirements ---
  ipcMain.handle('course-requirements:listByEmployee', (_, employeeId: string) => courseRequirements.listByEmployee(employeeId))
  ipcMain.handle('course-requirements:listByCourse', (_, courseId: string) => courseRequirements.listByCourse(courseId))
  ipcMain.handle('course-requirements:listByEmployees', (_, employeeIds: string[]) => courseRequirements.listByEmployees(employeeIds))
  ipcMain.handle('course-requirements:upsert', (_, data) => courseRequirements.upsert(data))
  ipcMain.handle('course-requirements:deleteAutoRuleByRuleId', (_, ruleId: string) => courseRequirements.deleteAutoRuleByRuleId(ruleId))
  ipcMain.handle('course-requirements:deleteManual', (_, employeeId: string, courseId: string) => courseRequirements.deleteManual(employeeId, courseId))

  // --- Training Records ---
  ipcMain.handle('training-records:listByEmployee', (_, employeeId: string) => trainingRecords.listByEmployee(employeeId))
  ipcMain.handle('training-records:listByCourse', (_, courseId: string) => trainingRecords.listByCourse(courseId))
  ipcMain.handle('training-records:listByEmployees', (_, employeeIds: string[]) => trainingRecords.listByEmployees(employeeIds))
  ipcMain.handle('training-records:getByEmployeeAndCourse', (_, employeeId: string, courseId: string) => trainingRecords.getByEmployeeAndCourse(employeeId, courseId))
  ipcMain.handle('training-records:upsert', (_, data) => trainingRecords.upsert(data))
  ipcMain.handle('training-records:delete', (_, id: string) => trainingRecords.delete(id))
  ipcMain.handle('training-records:getExpiringSoon', (_, days: number) => trainingRecords.getExpiringSoon(days))
  ipcMain.handle('training-records:getExpired', () => trainingRecords.getExpired())

  console.log('All IPC handlers registered')
}
