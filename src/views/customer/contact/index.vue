<template>
  <GiPageLayout>
    <GiTable
      title="客户联系人管理"
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
        <a-input-search v-model="queryForm.contactName" placeholder="请输入姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.fullNamePath" placeholder="请输入区域" allow-clear @search="search" />
        <a-input-search v-model="queryForm.mobile" placeholder="请输入手机号" allow-clear @search="search" />
        <a-select
          v-model="queryForm.status"
          :options="statusOptions"
          placeholder="请选择状态"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['customer:contact:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['customer:contact:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #createTime="{ record }">
        <span>{{ XEUtils.toDateString(record.createTime, 'yyyy-MM-dd') }}</span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['customer:contact:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['customer:contact:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['customer:contact:delete']"
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
import XEUtils from 'xe-utils'
import AddModal from './AddModal.vue'
import DetailDrawer from './DetailDrawer.vue'
import { type ContactQuery, type ContactResp, deleteContact, exportContact, listContact } from '@/apis/customer/contact'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Contact' })
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '失效', value: 2 },
  { label: '离职', value: 3 },
]
const queryForm = reactive<ContactQuery>({
  companyName: undefined,
  contactName: undefined,
  fullNamePath: undefined,
  mobile: undefined,
  status: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listContact({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [

  { title: '联系人编码', dataIndex: 'contactCode', slotName: 'contactCode' },
  { title: '区域', dataIndex: 'fullNamePath', slotName: 'fullNamePath' },
  { title: '单位名称', dataIndex: 'companyName', slotName: 'companyName' },
  { title: '姓名', dataIndex: 'contactName', slotName: 'contactName' },
  { title: '科室/部门', dataIndex: 'department', slotName: 'department' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['customer:contact:get', 'customer:contact:update', 'customer:contact:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.contactName = undefined
  queryForm.fullNamePath = undefined
  queryForm.mobile = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: ContactResp) => {
  return handleDelete(() => deleteContact(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportContact(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = () => {
  AddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ContactResp) => {
  AddModalRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: ContactResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
