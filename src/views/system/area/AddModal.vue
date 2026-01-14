<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 500 ? 500 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { mapTree } from 'xe-utils'
import { type AreaResp, addArea, getArea, updateArea } from '@/apis/system/area'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'

interface Props {
  areas: AreaResp[]
}
const props = withDefaults(defineProps<Props>(), {
  areas: () => [],
})

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改区域' : '新增区域'))
const formRef = ref<InstanceType<typeof GiForm>>()

// 转换为区域树
const areaSelectTree = computed(() => {
  const data = JSON.parse(JSON.stringify(props.areas)) as AreaResp[]
  return mapTree(data, (i) => ({
    key: i.id,
    title: i.areaName,
    children: i.children,
  }))
})

const [form, resetForm] = useResetReactive({
  sort: 999,
  status: 1,
  level: 1,
})

const columns: ColumnItem[] = reactive([
  {
    label: '上级区域',
    field: 'parentCode',
    type: 'tree-select',
    span: 24,
    props: {
      data: areaSelectTree,
      allowClear: true,
      allowSearch: true,
      fallbackOption: false,
      filterTreeNode(searchKey, nodeData) {
        if (nodeData.title) {
          return nodeData.title.toLowerCase().includes(searchKey.toLowerCase())
        }
        return false
      },
    },
    rules: [{ required: false, message: '请选择上级区域' }],
    hide: (form) => {
      const tree = areaSelectTree.value || []
      const hasParentNode = Boolean(tree.find((node) => node?.key === form.parentId))
      return form.parentId === 0 || (!hasParentNode && isUpdate.value)
    },
  },
  {
    label: '区域编码',
    field: 'areaCode',
    type: 'input',
    span: 24,
    props: {
      maxLength: 50,
      allowClear: true,
      placeholder: '请输入区域编码（唯一）',
    },
    rules: [
      { required: true, message: '请输入区域编码' },
      { pattern: /^[\w-]+$/, message: '区域编码只能包含字母、数字、下划线和连字符' },
    ],
  },
  {
    label: '区域名称',
    field: 'areaName',
    type: 'input',
    span: 24,
    props: {
      maxLength: 100,
    },
    rules: [{ required: true, message: '请输入区域名称' }],
  },
  {
    label: '层级',
    field: 'level',
    type: 'select',
    span: 24,
    props: {
      options: [
        { label: '省/直辖市', value: 1 },
        { label: '市', value: 2 },
        { label: '区/县', value: 3 },
        { label: '乡/镇', value: 4 },
      ],
      allowClear: false,
    },
    rules: [{ required: true, message: '请选择层级' }],
  },
  {
    label: '描述',
    field: 'description',
    type: 'textarea',
    span: 24,
    props: {
      maxLength: 500,
      autoSize: { minRows: 2, maxRows: 5 },
    },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateArea(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addArea(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = (id?: string) => {
  reset()
  form.parentId = id
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getArea(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
