import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/system/maxId'

export interface MaxIdResp {
  tableName: string
  fieldName: string
  maxIdValue: string
  keyRule: string
  mode: string
  prefix: string
  suffix: string
  stepLength: string
  remark: string
  guidValue: string
  createTime: string
  updateTime: string
  deleted: string
  tenantId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface MaxIdDetailResp {
  tableName: string
  fieldName: string
  maxIdValue: string
  keyRule: string
  mode: string
  prefix: string
  suffix: string
  stepLength: string
  remark: string
  guidValue: string
  createTime: string
  updateTime: string
  deleted: string
  tenantId: string
  createUserString: string
  updateUserString: string
}
export interface MaxIdQuery {
  tableName: string | undefined
  fieldName: string | undefined
  maxIdValue: string | undefined
  keyRule: string | undefined
  mode: string | undefined
  prefix: string | undefined
  suffix: string | undefined
  stepLength: string | undefined
  remark: string | undefined
  createTime: string | undefined
  deleted: string | undefined
  tenantId: string | undefined
  sort: Array<string>
}
export interface MaxIdPageQuery extends MaxIdQuery, PageQuery {}

/** @desc 查询系统MAX表列表 */
export function listMaxId(query: MaxIdPageQuery) {
  return http.get<PageRes<MaxIdResp[]>>(BASE_URL, query)
}

/** @desc 查询系统MAX表详情 */
export function getMaxId(id: string) {
  return http.get<MaxIdDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增系统MAX表 */
export function addMaxId(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改系统MAX表 */
export function updateMaxId(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除系统MAX表 */
export function deleteMaxId(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出系统MAX表 */
export function exportMaxId(query: MaxIdQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询系统MAX表字典 */
export function listMaxIdDict(query?: MaxIdQuery) {
return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}
