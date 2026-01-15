<template>
  <GiPageLayout :margin="false">
    <GiTable
      v-model:selectedKeys="selectedKeys"
      row-key="id"
      :data="companyList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%' }"
      :pagination="pagination"
      :disabled-tools="['size', 'refresh', 'pagination', 'setting']"
      :disabled-column-keys="['name']"
      :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      @select="onSelect"
      @select-all="onSelectAll"
      @refresh="search"
    >
      <template #top>
        <a-alert>
          <template v-if="selectedKeys.length > 0">
            已选中 {{ selectedKeys.length }} 条记录(可跨页)
          </template>
          <template v-else>未选中任何记录</template>
          <template v-if="selectedKeys.length > 0" #action>
            <a-link @click="onClearSelected">清空</a-link>
          </template>
        </a-alert>
      </template>
      <template #toolbar-left>
        <a-input-search v-model="queryForm.companyName" placeholder="请输入单位名称" allow-clear @search="search" />
        <a-button @click="search">
          <template #icon><icon-search /></template>
          <template #default>查询</template>
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
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
    </GiTable>
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useTable } from '@/hooks'
import { type CompanyQuery, type CompanyResp, listCompany } from '@/apis/customer/company'
import { useDict } from '@/hooks/app'

const props = defineProps({
  companyCode: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['select-company-code'])
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
// 添加标志位
const isInitializing = ref(false)
// 解析 companyCode 字符串
const parseCompanyCodes = () => {
  if (!props.companyCode) {
    return []
  }
  return props.companyCode.split(',')
    .map((code) => code.trim())
    .filter((code) => code && code !== '')
}

const {
  tableData: companyList,
  loading,
  pagination,
  search,
} = useTable((page) => listCompany({ ...queryForm, ...page }), { immediate: true })
const cooperationOptions = [
  { label: '供应商', value: 1 },
  { label: '终端客户', value: 2 },
  { label: '代理进销商', value: 4 },
  { label: '渠道客户', value: 8 },
]
const selectedKeys = ref<string[]>([])
const selectedData = ref<Map<string, CompanyResp>>(new Map())
const emitSelectCompany = () => {
  if (isInitializing.value) return
  const companyCodes = Array.from(selectedData.value.values())
    .map((company) => company.companyCode)
    .filter((code) => code)
  emit('select-company-code', { key: companyCodes, companyTreeData: companyList.value })
}
// 更新选中状态
const updateSelectedKeys = () => {
  const companyCodes = parseCompanyCodes()

  if (companyCodes.length === 0) {
    selectedKeys.value = []
    selectedData.value.clear()
    return
  }

  // 如果数据已经加载，设置选中
  if (companyList.value.length > 0) {
    // 查找匹配的companyCode对应的记录
    const matchedRecords: CompanyResp[] = []
    const matchedIds: string[] = []

    companyList.value.forEach((company) => {
      if (company.companyCode && companyCodes.includes(company.companyCode)) {
        matchedRecords.push(company)
        matchedIds.push(company.id)
      }
    })
    // 设置初始化标志
    isInitializing.value = true
    selectedKeys.value = matchedIds
    selectedData.value.clear()
    matchedRecords.forEach((record) => {
      selectedData.value.set(record.id, record)
    })
    // 重置标志位
    nextTick(() => {
      isInitializing.value = false
    })
  }
}
// 监听 companyCode 变化
watch(() => props.companyCode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // 延迟执行，确保DOM已更新
    nextTick(() => {
      updateSelectedKeys()
    })
  }
})

// 表格列配置
const columns: TableInstance['columns'] = [
  {
    title: '#',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  {
    title: '区域',
    dataIndex: 'fullNamePath',
    key: 'fullNamePath',
    align: 'center',
    width: 220,
  },
  {
    title: '单位全称',
    dataIndex: 'companyName',
    key: 'companyName',
  },
  { title: '合作模式', dataIndex: 'cooperationModel', slotName: 'cooperationModel', width: 100, align: 'center' },
]
// 重置
const reset = () => {
  queryForm.countryCode = undefined
  queryForm.provinceCode = undefined
  queryForm.cityCode = undefined
  queryForm.companyCode = undefined
  queryForm.companyName = undefined
  queryForm.cooperationModel = undefined
  search()
}
// 全选
const onSelectAll = (checked: boolean) => {
  if (checked) {
    // 全选时，将所有数据添加到 Map
    companyList.value.forEach((item) => {
      selectedData.value.set(item.id, item)
    })
    selectedKeys.value = Array.from(selectedData.value.keys())
  } else {
    // 取消全选时，清空 Map
    companyList.value.forEach((item) => {
      selectedData.value.delete(item.id)
    })
    selectedKeys.value = Array.from(selectedData.value.keys())
  }
  emitSelectCompany()
}
const onSelect = (rowKeys: string[], rowKey: string, record: CompanyResp) => {
  if (rowKeys.includes(rowKey)) {
    // 选中时，添加到 Map
    selectedData.value.set(rowKey, record)
    selectedKeys.value = Array.from(selectedData.value.keys())
  } else {
    // 取消选中时，从 Map 移除
    selectedData.value.delete(rowKey)
    selectedKeys.value = Array.from(selectedData.value.keys())
  }
  emitSelectCompany()
}
const onClearSelected = () => {
  selectedData.value.clear()
  selectedKeys.value = []
  emitSelectCompany()
}
const removeItemByKey = (key) => {
  selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
}
// 数据加载完成后更新选中状态
onMounted(() => {
  // 监听数据加载完成
  watch(() => companyList.value, () => {
    if (companyList.value.length > 0) {
      updateSelectedKeys()
    }
  }, { immediate: true })
})
defineExpose({ onClearSelected, removeItemByKey })
</script>

<style scoped>
  :deep(.gi-page-layout__body) {
    border-radius: 4px;
    background: #fff;
  }
.permission-company {
  padding: 6px;
  background: #fff;
  border-radius: 4px;
}

.company-selector {
  margin-bottom: 6px;
}

.company-list {
  margin-bottom: 16px;
}

.selected-info {
  margin-top: 16px;
}
</style>
