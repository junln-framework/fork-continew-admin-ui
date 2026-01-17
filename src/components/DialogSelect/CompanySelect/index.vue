<template>
  <GiPageLayout>
    <template #left>
      <Tree @node-click="search" />
    </template>
    <a-row justify="end">
      <a-space wrap>
        <a-input v-model="queryForm.companyName" placeholder="输入单位名称搜索" allow-clear style="max-width: 250px">
        </a-input>
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          <span>查询</span>
        </a-button>
        <a-button @click="reset">重置</a-button>
      </a-space>
    </a-row>

    <a-table
      class="gi_table" row-key="id" :loading="loading" :bordered="{ cell: true }" :columns="columns"
      :data="tableData" :scroll="{ x: '100%', y: '100%' }"
      :row-selection="{ type: props.multiple ? 'checkbox' : 'radio', showCheckedAll: true }" :pagination="pagination"
      @select="select" @select-all="selectAll"
    >
    </a-table>
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import Tree from '../CompanySelect/Tree.vue'
import { type CompanyQuery, listCompany } from '@/apis/customer/company'
import { useTable } from '@/hooks'

interface Props {
  multiple?: boolean
  queryParams?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  queryParams: () => ({}),
})

const columns = [
  {
    title: '#',
    width: 40,
    align: 'center',
    render: ({ rowIndex }) => (<span>{rowIndex + 1}</span>),
  },
  {
    title: '区域',
    dataIndex: 'areaFullPathName',
  },
  { title: '单位全称', dataIndex: 'companyName', slotName: 'companyName' },
  { title: '单位类型', dataIndex: 'companyTypeName', slotName: 'companyTypeName', width: 100, align: 'center' },
] as TableColumnData[]

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
  loading,
  tableData,
  pagination,
  search,
  select,
  selectAll,
  getSelectedData,
} = useTable((page) => listCompany({ ...queryForm, ...page }), { immediate: true })

const reset = () => {
  search()
}

defineExpose({ getSelectedData })
</script>

<style lang="scss" scoped></style>
