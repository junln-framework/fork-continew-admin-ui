<template>
  <a-drawer v-model:visible="visible" title="用户部门关系详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="用户ID">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="部门ID">{{ dataDetail?.deptId }}</a-descriptions-item>
      <a-descriptions-item label="是否主要部门">{{ dataDetail?.isPrimary }}</a-descriptions-item>
      <a-descriptions-item label="是否主管">{{ dataDetail?.isMaster }}</a-descriptions-item>
      <a-descriptions-item label="是否经理">{{ dataDetail?.isManager }}</a-descriptions-item>
      <a-descriptions-item label="描述">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.sort }}</a-descriptions-item>
      <a-descriptions-item label="租户ID">{{ dataDetail?.tenantId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type UserDeptDetailResp, getUserDept as getDetail } from '@/apis/system/userDept'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<UserDeptDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
