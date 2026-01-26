import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/system/user'

/** @desc 分配助理 */
export function assignAssistant(data: any) {
  return http.post(`${BASE_URL}/assistant/assign`, data)
}

/** @desc 解除助理 */
export function unAssign(param) {
  return http.del(`${BASE_URL}/assistant/unAssign`, param)
}

/** @desc 查询用户的关联助理列表 */
export function listAssistants(param) {
  return http.get<T.UserDetailResp>(`${BASE_URL}/assistant/listAssistants`, param)
}

/** @desc 查询助理的有效被协助人列表 */
export function listAssistedUsers(param) {
  return http.get<T.UserDetailResp>(`${BASE_URL}/assistant/listAssistedUsers`, param)
}
