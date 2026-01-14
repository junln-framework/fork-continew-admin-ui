<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%' }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['nickname']"
      @refresh="search"
    >
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset"></GiForm>
      </template>
      <template #nickname="{ record }">
        <GiCellAvatar :avatar="record.avatar" :name="record.nickname" />
      </template>
      <template #gender="{ record }">
        <GiCellGender :gender="record.gender" />
      </template>
      <template #roleNames="{ record }">
        <GiCellTags :data="record.roleNames" />
      </template>
      <template #deptNames="{ record }">
        <GiCellTags :data="record.deptNames" />
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:user:get']" title="数据权限" @click="assignDataRight(record)">数据权限</a-link>
        </a-space>
      </template>
    </GiTable>
    <AddModal ref="AddModalRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import 'vue3-tree-org/lib/vue3-tree-org.css'
import { Vue3TreeOrg } from 'vue3-tree-org'
import type { TableInstance } from '@arco-design/web-vue'
import AddModal from './AddModal.vue'
import type { UserResp } from '@/apis/system/type'
import { listUser } from '@/apis/system/user'
import { DisEnableStatusList } from '@/constant/common'
import { useResetReactive, useTable } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'

defineOptions({ name: 'Permission' })

const [queryForm, resetForm] = useResetReactive({
  sort: ['t1.id,desc'],
})

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '姓名',
    field: 'description',
    span: { xs: 24, sm: 8, xxl: 8 },
    props: {
      placeholder: '账号/姓名/描述',
    },
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    span: { xs: 24, sm: 6, xxl: 8 },
    props: {
      options: DisEnableStatusList,
      placeholder: '请选择状态',
    },
  },
  {
    type: 'range-picker',
    label: '创建时间',
    field: 'createTime',
    span: { xs: 24, sm: 10, xxl: 8 },
  },
])

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listUser({ ...queryForm, ...page }), { immediate: false })
const columns: TableInstance['columns'] = [
  {
    title: '#',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  {
    title: '姓名',
    dataIndex: 'nickname',
    slotName: 'nickname',
    minWidth: 100,
    ellipsis: true,
    tooltip: true,
  },
  { title: '账号', dataIndex: 'username', slotName: 'username', minWidth: 90, ellipsis: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center', minWidth: 90 },
  { title: '部门', dataIndex: 'deptNames', slotName: 'deptNames', minWidth: 90 },
  { title: '角色', dataIndex: 'roleNames', slotName: 'roleNames', minWidth: 90 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    align: 'center',
  },
]

// 重置
const reset = () => {
  resetForm()
  search()
}
onMounted(() => {
  search()
})
// 过滤树s
const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const assignDataRight = (record: UserResp) => {
  AddModalRef.value?.onAdd(record.id, `${record.deptNames} ${record.nickname}`)
}
// const handleAdd = (record: AreaResp) => {
//   onAdd(record.id)
// }
</script>

<style scoped lang="scss">

</style>
