<template>
  <GiPageLayout>
    <GiTable
      title="用户权限位图管理"
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
        <a-input-search v-model="queryForm.userId" placeholder="请输入用户ID" allow-clear @search="search" />
        <a-input-search v-model="queryForm.permissionType" placeholder="请输入AREA/COMPANY/CONTACTS" allow-clear @search="search" />
        <a-input-search v-model="queryForm.segment" placeholder="请输入分段编号" allow-clear @search="search" />
        <a-input-search v-model="queryForm.bitmapValue" placeholder="请输入64位位图值" allow-clear @search="search" />
        <a-input-search v-model="queryForm.bitCount" placeholder="请输入该段设置的位数" allow-clear @search="search" />
        <a-input-search v-model="queryForm.lastUpdateTime" placeholder="请输入最后更新时间" allow-clear @search="search" />
        <a-input-search v-model="queryForm.tenantId" placeholder="请输入租户ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:permissionUser:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:permissionUser:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:permissionUser:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:permissionUser:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:permissionUser:delete']"
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
import { type PermissionUserQuery, type PermissionUserResp, deletePermissionUser, exportPermissionUser, listPermissionUser } from '@/apis/system/permissionUser'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'PermissionUser' })

const queryForm = reactive<PermissionUserQuery>({
  userId: undefined,
  permissionType: undefined,
  segment: undefined,
  bitmapValue: undefined,
  bitCount: undefined,
  lastUpdateTime: undefined,
  tenantId: undefined,
  bitmapCooperationModel: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listPermissionUser({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '用户ID', dataIndex: 'userId', slotName: 'userId' },
  { title: 'AREA/COMPANY/CONTACTS', dataIndex: 'permissionType', slotName: 'permissionType' },
  { title: '分段编号', dataIndex: 'segment', slotName: 'segment' },
  { title: '64位位图值', dataIndex: 'bitmapValue', slotName: 'bitmapValue' },
  { title: '该段设置的位数', dataIndex: 'bitCount', slotName: 'bitCount' },
  { title: '最后更新时间', dataIndex: 'lastUpdateTime', slotName: 'lastUpdateTime' },
  { title: '租户ID', dataIndex: 'tenantId', slotName: 'tenantId' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:permissionUser:get', 'system:permissionUser:update', 'system:permissionUser:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.userId = undefined
  queryForm.permissionType = undefined
  queryForm.segment = undefined
  queryForm.bitmapValue = undefined
  queryForm.bitCount = undefined
  queryForm.lastUpdateTime = undefined
  queryForm.tenantId = undefined
  search()
}

// 删除
const onDelete = (record: PermissionUserResp) => {
  return handleDelete(() => deletePermissionUser(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportPermissionUser(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = () => {
  AddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: PermissionUserResp) => {
  AddModalRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: PermissionUserResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
