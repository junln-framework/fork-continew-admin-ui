<template>
  <GiPageLayout>
    <GiTable
      ref="tableRef"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #expand-icon="{ expanded }">
        <IconDown v-if="expanded" />
        <IconRight v-else />
      </template>
      <template #toolbar-left>
        <a-input v-model="name" placeholder="搜索区域名称" allow-clear>
          <template #prefix><icon-search /></template>
        </a-input>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:area:create']" type="primary" @click="onAdd()">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:area:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #level="{ record }">
        <a-tag v-if="record.level === 1" color="red" size="small">省/直辖市</a-tag>
        <a-tag v-else-if="record.level === 2" color="orange" size="small">市</a-tag>
        <a-tag v-else-if="record.level === 3" color="green" size="small">区/县</a-tag>
        <a-tag v-else-if="record.level === 4" color="blue" size="small">乡/镇</a-tag>
        <a-tag v-else-if="record.level === 0" color="blue" size="small"></a-tag>
        <a-tag v-else color="gray" size="small">未知</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:area:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:area:delete']"
            status="danger"
            :disabled="record.isActive === 1"
            :title="record.isActive ? '系统内置数据不能删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>
    <AddModal ref="AddModalRef" :areas="dataList" @save-success="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import 'vue3-tree-org/lib/vue3-tree-org.css'
import { Vue3TreeOrg } from 'vue3-tree-org'
import type { TableInstance } from '@arco-design/web-vue'
import AddModal from './AddModal.vue'
import { type AreaQuery, type AreaResp, deleteArea, exportArea, listArea } from '@/apis/system/area'
import type GiTable from '@/components/GiTable/index.vue'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'SystemArea' })

const queryForm = reactive<AreaQuery>({ })
const tableRef = ref<InstanceType<typeof GiTable>>()
const {
  tableData,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable(() => listArea(queryForm), {
  immediate: true,
  onSuccess: () => {
    // nextTick(() => {
    //   tableRef.value?.tableRef?.expandAll(true)
    // })
  },
})
// 区域树右键菜单
const menus = [
  { name: '添加区域', command: 'add' },
  { name: '编辑区域', command: 'edit' },
  { name: '删除区域', command: 'delete' },
]
// 所有节点展开状态
const nodeExpandAll = ref<boolean>(true)
// 过滤树
const searchData = (name: string) => {
  const loop = (data: AreaResp[]) => {
    const result = [] as AreaResp[]
    data.forEach((item: AreaResp) => {
      if (item.areaName?.toLowerCase().includes(name.toLowerCase())) {
        result.push({ ...item })
      } else if (item.children) {
        const filterData = loop(item.children)
        if (filterData.length) {
          result.push({
            ...item,
            children: filterData,
          })
        }
      }
    })
    return result
  }
  return loop(tableData.value)
}

const name = ref('')
const dataList = computed(() => {
  if (!name.value) return tableData.value
  return searchData(name.value)
})

const columns: TableInstance['columns'] = [
  { title: '区域编码', dataIndex: 'areaCode', minWidth: 120, ellipsis: true, tooltip: true, width: 220 },
  { title: '区域名称', dataIndex: 'areaName', minWidth: 150, ellipsis: true, tooltip: true, width: 160 },
  { title: '层级', dataIndex: 'level', slotName: 'level', align: 'center', width: 110 },
  { title: '排序', dataIndex: 'id', align: 'center', width: 80 },
  { title: '父级区域', dataIndex: 'fullNamePath', ellipsis: true, tooltip: true },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 240,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:area:update', 'system:area:delete', 'system:area:create']),
  },
]

// 重置
const reset = () => {
  name.value = ''
}

// 删除
const onDelete = (record: AreaResp) => {
  return handleDelete(() => deleteArea(record.id), {
    content: `是否确定删除区域「${record.areaName}」？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportArea(queryForm))
}

const AddModalRef = ref<InstanceType<typeof AddModal>>()
// 新增
const onAdd = (parentId?: string) => {
  AddModalRef.value?.onAdd(parentId)
}
// const handleAdd = (record: AreaResp) => {
//   onAdd(record.id)
// }
// 修改
const onUpdate = (record: AreaResp) => {
  AddModalRef.value?.onUpdate(record.id)
}
// 查看下级区域
// const onViewChildren = (record: AreaResp) => {
//   // 这里可以跳转到下级区域页面，或者展开当前节点
//   tableRef.value?.tableRef?.expandRow(record.id)
// }
</script>

<style scoped lang="scss">
:deep(.zm-draggable) {
  margin-top: 4px;
}

:deep(.zm-tree-org .zoom-container) {
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
}

:deep(.tree-org-node__content) {
  background-color: var(--color-bg-2);
  color: var(--color-text-1);
  cursor: pointer;
  position: relative;
}

.zm-tree-org {
  background-color: var(--color-bg-1);
  height: calc(100vh - 265px);
}

:global(.zm-tree-contextmenu) {
  color: var(--color-text-1) !important;
  position: fixed !important;
  background: var(--color-bg-2) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 4px !important;
  padding: 4px 0 !important;
  min-width: 120px !important;
  z-index: 999 !important;

  ul {
    background: var(--color-bg-1) !important;
    list-style-type: none !important;
    padding: 10px !important;
    margin: 0 !important;
  }

  .zm-tree-menu-item {
    background-color: var(--color-bg-1) !important;
    padding: 5px 15px !important;
    margin-top: 10px !important;
    cursor: pointer !important;
    transition: background-color 0.1s ease !important;
    list-style: none !important;
  }
}
:deep(.tree-org-node__expand){
  background-color: var(--color-bg-1) !important;
}
</style>
