<template>
  <GiPageLayout :margin="false">
    <GiTable
      v-model:selectedKeys="selectedKeys"
      row-key="id"
      :data="contactList"
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
        <a-input-search v-model="queryForm.contactName" style="width: 180px;" placeholder="请输入联系人名称" allow-clear @search="search" />
        <a-button @click="search">
          <template #icon><icon-search /></template>
          <template #default>查询</template>
        </a-button>
      </template>
    </GiTable>
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useTable } from '@/hooks'
import { type ContactQuery, type ContactResp, listContact } from '@/apis/customer/contact'

const props = defineProps({
  userId: {
    type: Number,
    default: null,
  },
})
const emit = defineEmits(['select-contact-code'])
const queryForm = reactive<ContactQuery>({
  companyName: undefined,
  contactName: undefined,
  fullNamePath: undefined,
  mobile: undefined,
  status: undefined,
  sort: ['id,desc'],
})

const {
  tableData: contactList,
  loading,
  pagination,
  search,
} = useTable((page) => listContact({ ...queryForm, ...page }), { immediate: true })
const selectedKeys = ref<string[]>([])
const selectedData = ref<Map<string, ContactResp>>(new Map())

const emitSelectContact = () => {
  const contactCodes = Array.from(selectedData.value.values())
    .map((contact) => contact.contactCode)
    .filter((code) => code)
  emit('select-contact-code', { key: contactCodes, contactList: contactList.value })
}

// 表格列配置
const columns: TableInstance['columns'] = [
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
  {
    title: '联系人名称',
    dataIndex: 'contactName',
    key: 'contactName',
  },
]

// 全选
const onSelectAll = (checked: boolean) => {
  if (checked) {
    // 全选时，将所有数据添加到 Map
    contactList.value.forEach((item) => {
      selectedData.value.set(item.id, item)
    })
    selectedKeys.value = Array.from(selectedData.value.keys())
  } else {
    // 取消全选时，清空 Map
    contactList.value.forEach((item) => {
      selectedData.value.delete(item.id)
    })
    selectedKeys.value = Array.from(selectedData.value.keys())
  }
  emitSelectContact()
}
const onSelect = (rowKeys: string[], rowKey: string, record: ContactResp) => {
  if (rowKeys.includes(rowKey)) {
    // 选中时，添加到 Map
    selectedData.value.set(rowKey, record)
    selectedKeys.value = Array.from(selectedData.value.keys())
  } else {
    // 取消选中时，从 Map 移除
    selectedData.value.delete(rowKey)
    selectedKeys.value = Array.from(selectedData.value.keys())
  }
  emitSelectContact()
}
const onClearSelected = () => {
  selectedData.value.clear()
  selectedKeys.value = []
  emitSelectContact()
}
const removeItemByKey = (key) => {
  selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
}
// 初始化加载
onMounted(() => {
  search()
})

defineExpose({ onClearSelected, removeItemByKey })
</script>

<style scoped>
    :deep(.gi-page-layout__body) {
    padding: 2px;
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
