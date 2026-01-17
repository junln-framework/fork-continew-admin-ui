<template>
  <a-drawer v-model:visible="visible" title="客户联系人详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="关联客户单位表ID">{{ dataDetail?.companyId }}</a-descriptions-item>
      <a-descriptions-item label="客户单位表编码">{{ dataDetail?.companyCode }}</a-descriptions-item>
      <a-descriptions-item label="联系人编码">{{ dataDetail?.contactCode }}</a-descriptions-item>
      <a-descriptions-item label="联系人姓名">{{ dataDetail?.contactName }}</a-descriptions-item>
      <a-descriptions-item label="国编码">{{ dataDetail?.countryCode }}</a-descriptions-item>
      <a-descriptions-item label="省编码(国标6位)">{{ dataDetail?.provinceCode }}</a-descriptions-item>
      <a-descriptions-item label="市编码(国标6位)">{{ dataDetail?.cityCode }}</a-descriptions-item>
      <a-descriptions-item label="区/县编码(国标6位)">{{ dataDetail?.districtCode }}</a-descriptions-item>
      <a-descriptions-item label="区域全路径显示">{{ dataDetail?.areaFullPathName }}</a-descriptions-item>
      <a-descriptions-item label="性别：0-未知，1-男，2-女">{{ dataDetail?.gender }}</a-descriptions-item>
      <a-descriptions-item label="职位">{{ dataDetail?.position }}</a-descriptions-item>
      <a-descriptions-item label="生日">{{ dataDetail?.birthday }}</a-descriptions-item>
      <a-descriptions-item label="所在科室/部门">{{ dataDetail?.department }}</a-descriptions-item>
      <a-descriptions-item label="手机号">{{ dataDetail?.mobile }}</a-descriptions-item>
      <a-descriptions-item label="固定电话">{{ dataDetail?.tel }}</a-descriptions-item>
      <a-descriptions-item label="邮箱">{{ dataDetail?.email }}</a-descriptions-item>
      <a-descriptions-item label="微信号">{{ dataDetail?.wechat }}</a-descriptions-item>
      <a-descriptions-item label="QQ号">{{ dataDetail?.qq }}</a-descriptions-item>
      <a-descriptions-item label="是否主联系人：0-否，1-是">{{ dataDetail?.isMain }}</a-descriptions-item>
      <a-descriptions-item label="联系人备注">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="状态：1-正常，2-失效，3-离职">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="负责人ID">{{ dataDetail?.ownerUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否已删除（0：否；id：是）">{{ dataDetail?.deleted }}</a-descriptions-item>
      <a-descriptions-item label="租户ID">{{ dataDetail?.tenantId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ContactDetailResp, getContact as getDetail } from '@/apis/customer/contact'
import { useDict } from '@/hooks/app'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ContactDetailResp>()
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
