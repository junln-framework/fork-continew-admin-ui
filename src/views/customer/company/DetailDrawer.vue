<template>
  <a-drawer v-model:visible="visible" title="客户单位详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="国编码">{{ dataDetail?.countryCode }}</a-descriptions-item>
      <a-descriptions-item label="省编码(国标6位)">{{ dataDetail?.provinceCode }}</a-descriptions-item>
      <a-descriptions-item label="市编码(国标6位)">{{ dataDetail?.cityCode }}</a-descriptions-item>
      <a-descriptions-item label="区/县编码(国标6位)">{{ dataDetail?.districtCode }}</a-descriptions-item>
      <a-descriptions-item label="邮政编码">{{ dataDetail?.zipCode }}</a-descriptions-item>
      <a-descriptions-item label="区域全路径显示">{{ dataDetail?.fullNamePath }}</a-descriptions-item>
      <a-descriptions-item label="客户单位编码">{{ dataDetail?.companyCode }}</a-descriptions-item>
      <a-descriptions-item label="客户单位全称">{{ dataDetail?.companyName }}</a-descriptions-item>
      <a-descriptions-item label="客户单位简称">{{ dataDetail?.companyShortName }}</a-descriptions-item>
      <a-descriptions-item label="客户单位类型(字典取值)">
        <GiCellTag :value="dataDetail?.companyTypeCode" :dict="company_type" />
      </a-descriptions-item>
      <a-descriptions-item label="客户单位类型(字典取值)">
        <GiCellTag :value="dataDetail?.companyTypeName" :dict="company_type" />
      </a-descriptions-item>
      <a-descriptions-item label="合作模式(1供应商/2终端客户/4代理进销商/8渠道客户)">{{ dataDetail?.cooperationModel }}</a-descriptions-item>
      <a-descriptions-item label="所属行业">{{ dataDetail?.industryType }}</a-descriptions-item>
      <a-descriptions-item label="注册资本(元)">{{ dataDetail?.registerCapital }}</a-descriptions-item>
      <a-descriptions-item label="注册地址">{{ dataDetail?.registerAddress }}</a-descriptions-item>
      <a-descriptions-item label="经营地址">{{ dataDetail?.businessAddress }}</a-descriptions-item>
      <a-descriptions-item label="法定代表人">{{ dataDetail?.legalPerson }}</a-descriptions-item>
      <a-descriptions-item label="统一社会信用代码">{{ dataDetail?.creditCode }}</a-descriptions-item>
      <a-descriptions-item label="税务登记证号">{{ dataDetail?.taxRegisterNo }}</a-descriptions-item>
      <a-descriptions-item label="开户银行">{{ dataDetail?.bankName }}</a-descriptions-item>
      <a-descriptions-item label="银行账号">{{ dataDetail?.bankAccount }}</a-descriptions-item>
      <a-descriptions-item label="适用税率">{{ dataDetail?.taxRate }}</a-descriptions-item>
      <a-descriptions-item label="主要联系人">{{ dataDetail?.mainContact }}</a-descriptions-item>
      <a-descriptions-item label="联系人手机号">{{ dataDetail?.contactMobile }}</a-descriptions-item>
      <a-descriptions-item label="联系人邮箱">{{ dataDetail?.contactEmail }}</a-descriptions-item>
      <a-descriptions-item label="固定电话">{{ dataDetail?.contactTel }}</a-descriptions-item>
      <a-descriptions-item label="单位备注">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="单位描述">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="状态：1-正常，2-暂停，3-注销，4-潜在">{{ dataDetail?.status }}</a-descriptions-item>
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
import { type CompanyDetailResp, getCompany as getDetail } from '@/apis/customer/company'
import { useDict } from '@/hooks/app'

const { company_type } = useDict('company_type')

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CompanyDetailResp>()
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
