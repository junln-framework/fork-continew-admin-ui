<template>
  <GiPageLayout>
    <GiTable
      title="系统MAX表管理"
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
	    <a-input-search v-model="queryForm.tableName" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.fieldName" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.maxIdValue" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.keyRule" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.mode" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.prefix" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.suffix" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.stepLength" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.remark" placeholder="请输入" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.deleted" placeholder="请输入是否已删除（0：否；id：是）" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.tenantId" placeholder="请输入租户ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:maxId:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:maxId:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:maxId:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:maxId:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:maxId:delete']"
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
import { type MaxIdResp, type MaxIdQuery, deleteMaxId, exportMaxId, listMaxId } from '@/apis/system/maxId'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'MaxId' })


const queryForm = reactive<MaxIdQuery>({
  tableName: undefined,
  fieldName: undefined,
  maxIdValue: undefined,
  keyRule: undefined,
  mode: undefined,
  prefix: undefined,
  suffix: undefined,
  stepLength: undefined,
  remark: undefined,
  createTime: undefined,
  deleted: undefined,
  tenantId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listMaxId({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstance['columns'] = [
  { title: '', dataIndex: 'tableName', slotName: 'tableName' },
  { title: '', dataIndex: 'fieldName', slotName: 'fieldName' },
  { title: '', dataIndex: 'maxIdValue', slotName: 'maxIdValue' },
  { title: '', dataIndex: 'keyRule', slotName: 'keyRule' },
  { title: '', dataIndex: 'mode', slotName: 'mode' },
  { title: '', dataIndex: 'prefix', slotName: 'prefix' },
  { title: '', dataIndex: 'suffix', slotName: 'suffix' },
  { title: '', dataIndex: 'stepLength', slotName: 'stepLength' },
  { title: '', dataIndex: 'remark', slotName: 'remark' },
  { title: '', dataIndex: 'guidValue', slotName: 'guidValue' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否已删除（0：否；id：是）', dataIndex: 'deleted', slotName: 'deleted' },
  { title: '租户ID', dataIndex: 'tenantId', slotName: 'tenantId' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:maxId:get', 'system:maxId:update', 'system:maxId:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.tableName = undefined
  queryForm.fieldName = undefined
  queryForm.maxIdValue = undefined
  queryForm.keyRule = undefined
  queryForm.mode = undefined
  queryForm.prefix = undefined
  queryForm.suffix = undefined
  queryForm.stepLength = undefined
  queryForm.remark = undefined
  queryForm.createTime = undefined
  queryForm.deleted = undefined
  queryForm.tenantId = undefined
  search()
}

// 删除
const onDelete = (record: MaxIdResp) => {
  return handleDelete(() => deleteMaxId(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportMaxId(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = () => {
  AddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: MaxIdResp) => {
  AddModalRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: MaxIdResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
