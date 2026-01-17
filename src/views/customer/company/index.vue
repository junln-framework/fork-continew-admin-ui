<template>
  <GiPageLayout>
    <GiTable
      title="客户单位管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search v-model="queryForm.companyCode" placeholder="请输入单位编码" allow-clear @search="search" />
        <a-input-search v-model="queryForm.companyName" placeholder="请输入单位全称" allow-clear @search="search" />
        <a-input-search v-model="queryForm.cooperationModel" placeholder="请输入合作模式" allow-clear @search="search" />
        <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人ID" allow-clear @search="search" />
        <a-button @click="search">
          <template #icon><icon-search /></template>
          <template #default>查询</template>
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['customer:company:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['customer:company:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #companyTypeCode="{ record }">
        <GiCellTag :value="record.companyTypeCode" :dict="company_type" />
      </template>
      <template #cooperationModel="{ record }">
        <span>
          {{
            cooperationOptions
              .filter(option => (record.cooperationModel & option.value) !== 0)
              .map(option => option.label)
              .join('、')
          }}
        </span>
      </template>
      <template #status="{ record }">
        <span>
          {{
            statusOptions
              .filter(option => (record.status === option.value))
              .map(option => option.label)
              .join('、')
          }}
        </span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['customer:company:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['customer:company:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['customer:company:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <AddModal ref="AddModalRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import AddModal from './AddModal.vue'
import DetailDrawer from './DetailDrawer.vue'
import { type CompanyQuery, type CompanyResp, deleteCompany, exportCompany, listCompany } from '@/apis/customer/company'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Company' })

const { company_type } = useDict('company_type')

const queryForm = reactive<CompanyQuery>({
  countryCode: undefined,
  provinceCode: undefined,
  cityCode: undefined,
  companyCode: undefined,
  companyName: undefined,
  cooperationModel: undefined,
  createUser: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCompany({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '单位编码', dataIndex: 'companyCode', slotName: 'companyCode', width: 160, align: 'center' },
  { title: '区域', dataIndex: 'areaFullPathName', slotName: 'areaFullPathName', width: 220, align: 'center' },
  { title: '单位全称', dataIndex: 'companyName', slotName: 'companyName' },
  { title: '单位类型', dataIndex: 'companyTypeName', slotName: 'companyTypeName', width: 100, align: 'center' },
  { title: '合作模式', dataIndex: 'cooperationModel', slotName: 'cooperationModel', width: 160, align: 'center' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80, align: 'center' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser', width: 110, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime', width: 180 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['customer:company:get', 'customer:company:update', 'customer:company:delete']),
  },
]
// 合作模式选项配置（抽离为常量，便于统一维护）
const cooperationOptions = [
  { label: '供应商', value: 1 },
  { label: '终端客户', value: 2 },
  { label: '代理进销商', value: 4 },
  { label: '渠道客户', value: 8 },
]
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '暂停', value: 2 },
  { label: '注销', value: 3 },
]
// 重置
const reset = () => {
  queryForm.countryCode = undefined
  queryForm.provinceCode = undefined
  queryForm.cityCode = undefined
  queryForm.companyCode = undefined
  queryForm.companyName = undefined
  queryForm.cooperationModel = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: CompanyResp) => {
  return handleDelete(() => deleteCompany(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCompany(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = () => {
  AddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CompanyResp) => {
  AddModalRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: CompanyResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
