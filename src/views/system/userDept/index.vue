<template>
  <GiPageLayout>
    <GiTable
      title="用户部门关系管理"
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
	    <a-input-search v-model="queryForm.tenantId" placeholder="请输入租户ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:userDept:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:userDept:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:userDept:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:userDept:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:userDept:delete']"
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
import { type UserDeptResp, type UserDeptQuery, deleteUserDept, exportUserDept, listUserDept } from '@/apis/system/userDept'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'UserDept' })


const queryForm = reactive<UserDeptQuery>({
  tenantId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listUserDept({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '', dataIndex: 'id', slotName: 'id' },
  { title: '用户ID', dataIndex: 'userId', slotName: 'userId' },
  { title: '部门ID', dataIndex: 'deptId', slotName: 'deptId' },
  { title: '是否主要部门', dataIndex: 'isPrimary', slotName: 'isPrimary' },
  { title: '是否主管', dataIndex: 'isMaster', slotName: 'isMaster' },
  { title: '是否经理', dataIndex: 'isManager', slotName: 'isManager' },
  { title: '描述', dataIndex: 'description', slotName: 'description' },
  { title: '', dataIndex: 'sort', slotName: 'sort' },
  { title: '租户ID', dataIndex: 'tenantId', slotName: 'tenantId' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:userDept:get', 'system:userDept:update', 'system:userDept:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.tenantId = undefined
  search()
}

// 删除
const onDelete = (record: UserDeptResp) => {
  return handleDelete(() => deleteUserDept(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportUserDept(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = () => {
  AddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: UserDeptResp) => {
  AddModalRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: UserDeptResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
