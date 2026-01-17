import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/customer/contact'

export interface ContactResp {
  id: string
  companyId: string
  companyCode: string
  contactCode: string
  contactName: string
  countryCode: string
  provinceCode: string
  cityCode: string
  districtCode: string
  areaLevel: number
  areaFullPathCode: string
  areaFullPathName: string
  gender: string
  position: string
  birthday: string
  department: string
  mobile: string
  tel: string
  email: string
  wechat: string
  qq: string
  isMain: string
  remark: string
  status: string
  ownerUser: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  deleted: string
  tenantId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ContactDetailResp {
  id: string
  companyId: string
  companyCode: string
  contactCode: string
  contactName: string
  countryCode: string
  provinceCode: string
  cityCode: string
  districtCode: string
  areaLevel: number
  areaFullPathCode: string
  areaFullPathName: string
  gender: string
  position: string
  birthday: string
  department: string
  mobile: string
  tel: string
  email: string
  wechat: string
  qq: string
  isMain: string
  remark: string
  status: string
  ownerUser: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  deleted: string
  tenantId: string
  createUserString: string
  updateUserString: string
}
export interface ContactQuery {
  companyName: string | undefined
  contactName: string | undefined
  areaFullPathName: string | undefined
  mobile: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface ContactPageQuery extends ContactQuery, PageQuery {}

/** @desc 查询客户联系人列表 */
export function listContact(query: ContactPageQuery) {
  return http.get<PageRes<ContactResp[]>>(BASE_URL, query)
}

/** @desc 查询客户联系人详情 */
export function getContact(id: string) {
  return http.get<ContactDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增客户联系人 */
export function addContact(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改客户联系人 */
export function updateContact(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除客户联系人 */
export function deleteContact(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出客户联系人 */
export function exportContact(query: ContactQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询客户联系人字典 */
export function listContactDict(query?: ContactQuery) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}
