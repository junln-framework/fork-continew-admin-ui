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
    <GiForm ref="formRef" v-model="form" :columns="columns" layout="inline" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addContact, getContact, updateContact } from '@/apis/customer/contact'
import { selectCompanyListDialog } from '@/components/DialogSelect'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { GenderList } from '@/constant/common'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改客户联系人' : '新增客户联系人'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
  companyId: '',
  companyName: '',
  companyCode: '',
})

const columns: ColumnItem[] = reactive([
  {
    label: '请选择单位',
    type: 'input-search',
    field: 'companyName',
    props: {
      disabled: true,
      placeholder: '',
      onSearch: () => {
        selectCompanyListDialog({
          multiple: false,
          onOk: (data) => {
            form.companyId = data.map((i) => i.id).join(',')
            form.companyName = data.map((i) => i.companyName).join(',')
            form.companyCode = data.map((i) => i.companyCode).join(',')
          },
        })
      },
      onClear: () => {
        form.companyId = ''
        form.companyName = ''
        form.companyCode = ''
      },
    },
    span: 24,
    required: true,
  },
  {
    label: '联系人姓名',
    field: 'contactName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '性别',
    field: 'gender',
    type: 'radio-group',
    span: 12,
    props: {
      options: GenderList,
    },
  },
  {
    label: '职位',
    field: 'position',
    type: 'input',
    span: 12,
  },
  {
    label: '科室/部门',
    field: 'department',
    type: 'input',
    span: 12,
  },
  {
    label: '手机号',
    field: 'mobile',
    type: 'input',
    span: 12,
  },
  {
    label: '固定电话',
    field: 'tel',
    type: 'input',
    span: 12,
  },
  {
    label: '邮箱',
    field: 'email',
    type: 'input',
    span: 12,
  },
  {
    label: '联系人备注',
    field: 'remark',
    type: 'textarea',
    props: {
      autoSize: true,
    },
    span: 24,
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
      await updateContact(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addContact(form)
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
  const { data } = await getContact(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
