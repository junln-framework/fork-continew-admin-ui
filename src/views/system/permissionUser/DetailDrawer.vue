<template>
  <a-drawer v-model:visible="visible" title="用户权限位图详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="用户ID">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="AREA/COMPANY/CONTACTS">{{ dataDetail?.permissionType }}</a-descriptions-item>
      <a-descriptions-item label="分段编号">{{ dataDetail?.segment }}</a-descriptions-item>
      <a-descriptions-item label="64位位图值">{{ dataDetail?.bitmapValue }}</a-descriptions-item>
      <a-descriptions-item label="该段设置的位数">{{ dataDetail?.bitCount }}</a-descriptions-item>
      <a-descriptions-item label="最后更新时间">{{ dataDetail?.lastUpdateTime }}</a-descriptions-item>
      <a-descriptions-item label="租户ID">{{ dataDetail?.tenantId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type PermissionUserDetailResp, getPermissionUser as getDetail } from '@/apis/system/permissionUser'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<PermissionUserDetailResp>()
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
