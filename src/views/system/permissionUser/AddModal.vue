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
import { getPermissionUser, addPermissionUser, updatePermissionUser } from '@/apis/system/permissionUser'
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
const title = computed(() => (isUpdate.value ? '修改用户权限位图' : '新增用户权限位图'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '用户ID',
    field: 'userId',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: 'AREA/COMPANY/CONTACTS',
    field: 'permissionType',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '分段编号',
    field: 'segment',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '64位位图值',
    field: 'bitmapValue',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '该段设置的位数',
    field: 'bitCount',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '最后更新时间',
    field: 'lastUpdateTime',
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
      await updatePermissionUser(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addPermissionUser(form)
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
  const { data } = await getPermissionUser(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
