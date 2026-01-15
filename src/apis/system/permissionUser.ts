import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/system/permissionUser'

export interface PermissionUserResp {
  id: string
  userId: string
  permissionType: string
  segment: string
  bitmapValue: string
  bitCount: string
  lastUpdateTime: string
  tenantId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface PermissionUserDetailResp {
  id: string
  userId: string
  permissionType: string
  segment: string
  bitmapValue: string
  bitCount: string
  lastUpdateTime: string
  tenantId: string
  createUserString: string
  updateUserString: string
}
export interface PermissionUserQuery {
  userId: string | undefined
  permissionType: string | undefined
  segment: string | undefined
  bitmapValue: string | undefined
  bitCount: string | undefined
  lastUpdateTime: string | undefined
  tenantId: string | undefined
  sort: Array<string>
}

export interface PermissionReq {
  userId: string | undefined
  areas: string | ''
  companies: string | ''
  contacts: string | ''
}

export interface UserPermissionDataResp {
  permissionType: string
  info: string
  id?: string | number | undefined
  code: string | undefined
  fullNamePath?: string | undefined
  type: string
  level?: number
}

export interface PermissionUserPageQuery extends PermissionUserQuery, PageQuery {}

/** @desc 查询用户权限位图列表 */
export function listPermissionUser(query: PermissionUserPageQuery) {
  return http.get<PageRes<PermissionUserResp[]>>(BASE_URL, query)
}

/** @desc 查询用户权限位图详情 */
export function getPermissionUser(id: string) {
  return http.get<PermissionUserDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增用户权限位图 */
export function addPermissionUser(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改用户权限位图 */
export function updatePermissionUser(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除用户权限位图 */
export function deletePermissionUser(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出用户权限位图 */
export function exportPermissionUser(query: PermissionUserQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询用户权限位图字典 */
export function listPermissionUserDict(query?: PermissionUserQuery) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}

/** @desc 新增用户权限位图 */
export function saveUserPermissions(data: any) {
  return http.post(`${BASE_URL}/saveUserPermissions`, data)
}

/** @desc 查询用户权限位图详情 */
export function getPermissionUserReq(id: string) {
  return http.get<PermissionReq>(`${BASE_URL}/getUserPermissionsReq/${id}`)
}

export function getUserPermissionsSelected(id: string) {
  return http.get<UserPermissionDataResp[]>(`${BASE_URL}/getUserPermissionsSelected/${id}`)
}
