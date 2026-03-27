import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // --- Accounts ---
  accounts: {
    list: () => ipcRenderer.invoke('accounts:list'),
    getById: (id: string) => ipcRenderer.invoke('accounts:getById', id),
    create: (data: { name: string; description?: string }) => ipcRenderer.invoke('accounts:create', data),
    update: (id: string, data: { name?: string; description?: string | null }) => ipcRenderer.invoke('accounts:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('accounts:delete', id),
  },

  // --- Contracts ---
  contracts: {
    listByAccount: (accountId: string) => ipcRenderer.invoke('contracts:listByAccount', accountId),
    getById: (id: string) => ipcRenderer.invoke('contracts:getById', id),
    create: (data: { account_id: string; name: string; description?: string }) => ipcRenderer.invoke('contracts:create', data),
    update: (id: string, data: { name?: string; description?: string | null; is_active?: boolean }) => ipcRenderer.invoke('contracts:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('contracts:delete', id),
  },

  // --- Sites ---
  sites: {
    listByContract: (contractId: string) => ipcRenderer.invoke('sites:listByContract', contractId),
    getById: (id: string) => ipcRenderer.invoke('sites:getById', id),
    create: (data: { contract_id: string; name: string; location?: string }) => ipcRenderer.invoke('sites:create', data),
    update: (id: string, data: { name?: string; location?: string | null; is_active?: boolean }) => ipcRenderer.invoke('sites:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('sites:delete', id),
  },

  // --- Employees ---
  employees: {
    listBySite: (siteId: string) => ipcRenderer.invoke('employees:listBySite', siteId),
    getById: (id: string) => ipcRenderer.invoke('employees:getById', id),
    getWithAttributes: (id: string) => ipcRenderer.invoke('employees:getWithAttributes', id),
    listWithAttributes: (siteIds: string[]) => ipcRenderer.invoke('employees:listWithAttributes', siteIds),
    create: (data: { site_id: string; name: string; email?: string; attributes?: Record<string, string> }) => ipcRenderer.invoke('employees:create', data),
    update: (id: string, data: { name?: string; email?: string | null; site_id?: string }) => ipcRenderer.invoke('employees:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('employees:delete', id),
    setAttribute: (employeeId: string, key: string, value: string) => ipcRenderer.invoke('employees:setAttribute', employeeId, key, value),
    removeAttribute: (employeeId: string, key: string) => ipcRenderer.invoke('employees:removeAttribute', employeeId, key),
    getDistinctAttributeKeys: () => ipcRenderer.invoke('employees:getDistinctAttributeKeys'),
  },

  // --- Employee Classes ---
  employeeClasses: {
    listByEmployee: (employeeId: string) => ipcRenderer.invoke('employee-classes:listByEmployee', employeeId),
    listByClass: (classId: string) => ipcRenderer.invoke('employee-classes:listByClass', classId),
    assign: (employeeId: string, classHierarchyId: string) => ipcRenderer.invoke('employee-classes:assign', employeeId, classHierarchyId),
    unassign: (employeeId: string, classHierarchyId: string) => ipcRenderer.invoke('employee-classes:unassign', employeeId, classHierarchyId),
  },

  // --- Class Hierarchies ---
  classHierarchies: {
    listByAccount: (accountId: string) => ipcRenderer.invoke('class-hierarchies:listByAccount', accountId),
    getById: (id: string) => ipcRenderer.invoke('class-hierarchies:getById', id),
    getDescendantIds: (id: string) => ipcRenderer.invoke('class-hierarchies:getDescendantIds', id),
    create: (data: { name: string; account_id: string; parent_id?: string }) => ipcRenderer.invoke('class-hierarchies:create', data),
    update: (id: string, data: { name?: string; parent_id?: string | null }) => ipcRenderer.invoke('class-hierarchies:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('class-hierarchies:delete', id),
  },

  // --- Courses ---
  courses: {
    list: (accountId?: string) => ipcRenderer.invoke('courses:list', accountId),
    getById: (id: string) => ipcRenderer.invoke('courses:getById', id),
    create: (data: { name: string; description?: string; category?: string; account_id?: string; valid_for_months?: number; completion_window_days?: number }) => ipcRenderer.invoke('courses:create', data),
    update: (id: string, data: { name?: string; description?: string | null; category?: string | null; valid_for_months?: number | null; completion_window_days?: number | null }) => ipcRenderer.invoke('courses:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('courses:delete', id),
  },

  // --- Course Requirements ---
  courseRequirements: {
    listByEmployee: (employeeId: string) => ipcRenderer.invoke('course-requirements:listByEmployee', employeeId),
    listByCourse: (courseId: string) => ipcRenderer.invoke('course-requirements:listByCourse', courseId),
    listByEmployees: (employeeIds: string[]) => ipcRenderer.invoke('course-requirements:listByEmployees', employeeIds),
    upsert: (data: { employee_id: string; course_id: string; source: 'MANUAL' | 'AUTO_RULE'; source_rule_id?: string | null }) => ipcRenderer.invoke('course-requirements:upsert', data),
    deleteAutoRuleByRuleId: (ruleId: string) => ipcRenderer.invoke('course-requirements:deleteAutoRuleByRuleId', ruleId),
    deleteManual: (employeeId: string, courseId: string) => ipcRenderer.invoke('course-requirements:deleteManual', employeeId, courseId),
  },

  // --- Training Records ---
  trainingRecords: {
    listByEmployee: (employeeId: string) => ipcRenderer.invoke('training-records:listByEmployee', employeeId),
    listByCourse: (courseId: string) => ipcRenderer.invoke('training-records:listByCourse', courseId),
    listByEmployees: (employeeIds: string[]) => ipcRenderer.invoke('training-records:listByEmployees', employeeIds),
    getByEmployeeAndCourse: (employeeId: string, courseId: string) => ipcRenderer.invoke('training-records:getByEmployeeAndCourse', employeeId, courseId),
    upsert: (data: { employee_id: string; course_id: string; completed_at: string; expires_at?: string | null; notes?: string }) => ipcRenderer.invoke('training-records:upsert', data),
    delete: (id: string) => ipcRenderer.invoke('training-records:delete', id),
    getExpiringSoon: (days: number) => ipcRenderer.invoke('training-records:getExpiringSoon', days),
    getExpired: () => ipcRenderer.invoke('training-records:getExpired'),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
