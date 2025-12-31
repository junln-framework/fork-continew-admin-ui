import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/system/userDept'

export interface UserDeptResp {
  id: string
  userId: string
  deptId: string
  isPrimary: string
  isMaster: string
  isManager: string
  description: string
  sort: string
  tenantId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface UserDeptDetailResp {
  id: string
  userId: string
  deptId: string
  isPrimary: string
  isMaster: string
  isManager: string
  description: string
  sort: string
  tenantId: string
  createUserString: string
  updateUserString: string
}
export interface UserDeptQuery {
  tenantId: string | undefined
  sort: Array<string>
}
export interface UserDeptPageQuery extends UserDeptQuery, PageQuery {}

/** @desc 查询用户部门关系列表 */
export function listUserDept(query: UserDeptPageQuery) {
  return http.get<PageRes<UserDeptResp[]>>(BASE_URL, query)
}

/** @desc 查询用户部门关系详情 */
export function getUserDept(id: string) {
  return http.get<UserDeptDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增用户部门关系 */
export function addUserDept(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改用户部门关系 */
export function updateUserDept(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除用户部门关系 */
export function deleteUserDept(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出用户部门关系 */
export function exportUserDept(query: UserDeptQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询用户部门关系字典 */
export function listUserDeptDict(query?: UserDeptQuery) {
return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}
