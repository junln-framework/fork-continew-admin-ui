<template>
  <a-drawer v-model:visible="visible" title="系统MAX表详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="">{{ dataDetail?.tableName }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.fieldName }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.maxIdValue }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.keyRule }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.mode }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.prefix }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.suffix }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.stepLength }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.guidValue }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否已删除（0：否；id：是）">{{ dataDetail?.deleted }}</a-descriptions-item>
      <a-descriptions-item label="租户ID">{{ dataDetail?.tenantId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type MaxIdDetailResp, getMaxId as getDetail } from '@/apis/system/maxId'
import { useDict } from '@/hooks/app'


const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<MaxIdDetailResp>()
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
