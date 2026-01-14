<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
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
import { getMaxId, addMaxId, updateMaxId } from '@/apis/system/maxId'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改系统MAX表' : '新增系统MAX表'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '',
    field: 'tableName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'fieldName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'maxIdValue',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'keyRule',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'mode',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'prefix',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'suffix',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'stepLength',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '',
    field: 'remark',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '创建时间',
    field: 'createTime',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '是否已删除（0：否；id：是）',
    field: 'deleted',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '租户ID',
    field: 'tenantId',
    type: 'input',
    span: 24,
    required: true,
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
      await updateMaxId(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addMaxId(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getMaxId(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
