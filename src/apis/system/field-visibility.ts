import http from '@/utils/http'

export type * from './type'
const BASE_URL = '/system/field-visibility-config'

export interface FieldMetaResp {
  fieldName: string
  fieldType: string
  defaultAlias: string
  defaultSort: number
  allowHide: boolean
  visible: boolean
}

export interface TableNameResp {
  businessTable: string
  tableName: string
}

/** @desc 查询字典列表 */
export function getTableList() {
  return http.get<[]>(`${BASE_URL}/table-list`)
}

// 获取字段元数据
export const getFieldMeta = (params) => {
  return http.get<FieldMetaResp[]>(`${BASE_URL}/meta`, params)
}

// 获取用户完整配置
export const getUserFullConfig = (params) => {
  return http.get<[]>(`${BASE_URL}/user-full-config`, params)
}

// 批量保存配置
export const batchSaveFieldConfig = (data) => {
  return http.post(`${BASE_URL}/batch-save`, data)
}
