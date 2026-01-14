import CompanySelect from './CompanySelect/index.vue'
import { createSelectDialog } from '@/utils/createSelectDialog'
import type { CompanyResp } from '@/apis/customer/company'

export const selectCompanyListDialog = createSelectDialog<CompanyResp[]>({
  title: '选择单位',
  component: CompanySelect,
})
