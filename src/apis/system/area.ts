import type { TreeNodeData } from '@arco-design/web-vue'
import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/system/area'

/** @desc 查询区域列表 */
export function listArea(query: T.AreaQuery) {
  return http.get<T.AreaResp[]>(`${BASE_URL}/tree`, query)
}

/** @desc 查询区域详情 */
export function getArea(id: string) {
  return http.get<T.AreaResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增区域 */
export function addArea(data: any) {
  return http.post<boolean>(`${BASE_URL}`, data)
}

/** @desc 修改区域 */
export function updateArea(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除区域 */
export function deleteArea(id: string) {
  return http.del(`${BASE_URL}`, { ids: [id] })
}

/** @desc 导出区域 */
export function exportArea(query: T.AreaQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
