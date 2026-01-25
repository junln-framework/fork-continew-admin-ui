import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/customer/company'

export interface CompanyResp {
  id: string
  countryCode: string
  provinceCode: string
  cityCode: string
  districtCode: string
  zipCode: string
  areaLevel: number
  areaFullPathCode: string
  areaFullPathName: string
  companyCode: string
  companyName: string
  companyShortName: string
  companyTypeCode: string
  companyTypeName: string
  companyCooperationModel: number
  industryType: string
  registerCapital: string
  registerAddress: string
  businessAddress: string
  legalPerson: string
  creditCode: string
  taxRegisterNo: string
  bankName: string
  bankAccount: string
  taxRate: string
  mainContact: string
  contactMobile: string
  contactEmail: string
  contactTel: string
  remark: string
  description: string
  status: number
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
export interface CompanyDetailResp {
  id: string
  countryCode: string
  provinceCode: string
  cityCode: string
  districtCode: string
  zipCode: string
  areaLevel: number
  areaFullPathCode: string
  areaFullPathName: string
  companyCode: string
  companyName: string
  companyShortName: string
  companyTypeCode: string
  companyTypeName: string
  companyCooperationModel: number
  industryType: string
  registerCapital: string
  registerAddress: string
  businessAddress: string
  legalPerson: string
  creditCode: string
  taxRegisterNo: string
  bankName: string
  bankAccount: string
  taxRate: string
  mainContact: string
  contactMobile: string
  contactEmail: string
  contactTel: string
  remark: string
  description: string
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  deleted: string
  tenantId: string
  createUserString: string
  updateUserString: string
}
export interface CompanyQuery {
  countryCode: string | undefined
  provinceCode: string | undefined
  cityCode: string | undefined
  companyCode: string | undefined
  companyName: string | undefined
  companyCooperationModel: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface CompanyPageQuery extends CompanyQuery, PageQuery {}

/** @desc 查询客户单位列表 */
export function listCompany(query: CompanyPageQuery) {
  return http.get<PageRes<CompanyResp[]>>(BASE_URL, query)
}

/** @desc 查询客户单位详情 */
export function getCompany(id: string) {
  return http.get<CompanyDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增客户单位 */
export function addCompany(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改客户单位 */
export function updateCompany(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除客户单位 */
export function deleteCompany(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出客户单位 */
export function exportCompany(query: CompanyQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询客户单位字典 */
export function listCompanyDict(query?: CompanyQuery) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}
