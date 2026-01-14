<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 700 ? '65%' : '100%'"
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
import { addCompany, getCompany, updateCompany } from '@/apis/customer/company'
import { listArea } from '@/apis/system/area'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import type { AreaLevelCodes, AreaResp } from '@/apis/system/type'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改客户单位' : '新增客户单位'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { company_type } = useDict('company_type')

const [form, resetForm] = useResetReactive({
  // todo 待补充
  // 地区相关字段（4级）
  countryCode: '',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  zipCode: '',
  fullNamePath: '',
  companyName: '',
  cooperationModelArr: [],
  cooperationModel: 0,
  companyTypeCode: '',
  creditCode: '',
  legalPerson: '',
  registerCapital: '',
  bankName: '',
  bankAccount: '',
  taxRate: '',
  registerAddress: '',
  businessAddress: '',
  mainContact: '',
  contactMobile: '',
  contactEmail: '',
  contactTel: '',
  remark: '',

})

// 合作模式选项配置（抽离为常量，便于统一维护）
const cooperationOptions = [
  { label: '供应商', value: 1 },
  { label: '终端客户', value: 2 },
  { label: '代理进销商', value: 4 },
  { label: '渠道客户', value: 8 },
]
// 绑定选中值
// const cooperationCheckedValues = ref([])
const areaTreeData = ref<AreaResp[]>([])
const columns: ColumnItem[] = reactive([
  {
    label: '单位全称',
    field: 'companyName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '合作模式',
    field: 'cooperationModelArr',
    type: 'checkbox-group',
    span: 24,
    required: true,
    props: {
      options: cooperationOptions,
    },
  },
  {
    label: '所在区域',
    field: 'districtCode',
    type: 'tree-select',
    span: 12,
    required: true,
    props: {
      // todo 待补充区域数据
      data: areaTreeData,
      loadMore: async (node: any) => {
        if (!node) {
          // 如果节点为空，确保 areaTreeData 已有根节点数据
          return areaTreeData.value
        }

        const level = node.level + 1
        const parentCode = node.areaCode || node.code
        try {
          const { data } = await listArea({ parentCode, level })

          // ⚠️ 重要：需要手动更新节点数据
          const newNodes = data.map((item) => ({
            ...item,
            isLeaf: level >= 3,
            level,
            children: level < 3 ? [] : undefined,
            parent: node,
          }))

          // 找到父节点并更新其 children
          const updateNodeChildren = (nodes: any[], targetNode: any, newChildren: any[]) => {
            for (const n of nodes) {
              if (n.areaCode === targetNode.areaCode) {
                n.children = newChildren
                return true
              }
              if (n.children && n.children.length > 0) {
                if (updateNodeChildren(n.children, targetNode, newChildren)) {
                  return true
                }
              }
            }
            return false
          }

          // 更新 areaTreeData 中的对应节点
          updateNodeChildren(areaTreeData.value, node, newNodes)

          // 触发响应式更新
          areaTreeData.value = [...areaTreeData.value]

          return newNodes
        } catch (error) {
          console.error('加载子节点失败:', error)
          return []
        }
      },
      // 其他属性
      allowClear: true,
      allowSearch: true,
      placeholder: '请选择省/市/区',
      // 字段映射（根据 Arco Design Vue 的要求）
      fieldNames: {
        key: 'areaCode',
        title: 'areaName',
        children: 'children',
      },
      multiple: false,
      // 只允许选择叶子节点（区县）
      checkable: false,
      defaultExpandAll: false,
      // 直接在 props 中定义 change 事件
      onChange: (val: any) => {
        const getAreaLevelInfo = (
          code: string,
          treeData: AreaResp[],
        ): {
          codes: AreaLevelCodes
          node: AreaResp | null
          path: AreaResp[]
          pathNames: string[]
          level: 'country' | 'province' | 'city' | 'district' | 'unknown'
        } => {
          // 默认值
          const defaultResult = {
            codes: {
              countryCode: '',
              provinceCode: '',
              cityCode: '',
              districtCode: '',
            },
            node: null,
            path: [],
            pathNames: [],
            level: 'unknown' as const,
          }

          if (!code || !treeData || treeData.length === 0) {
            return defaultResult
          }
          // 1. 查找节点路径
          const findPath = (searchCode: string, nodeList: AreaResp[], currentPath: AreaResp[] = []): AreaResp[] | null => {
            for (const node of nodeList) {
              const newPath = [...currentPath, node]

              if (node.areaCode === searchCode) {
                return newPath
              }

              if (node.children && node.children.length > 0) {
                const result = findPath(searchCode, node.children, newPath)
                if (result) return result
              }
            }
            return null
          }

          const path = findPath(code, treeData)

          if (!path || path.length === 0) {
            return defaultResult
          }

          const node = path[path.length - 1]
          const pathLength = path.length

          // 2. 确定层级
          let level: 'country' | 'province' | 'city' | 'district'

          if (pathLength === 1) {
            level = 'country'
          } else if (pathLength === 2) {
            level = 'province'
          } else if (pathLength === 3) {
            // 需要判断是否是直辖市结构
            const parentNode = path[1]
            const isMunicipality = parentNode.areaName.includes('直辖市')
              || ['北京市', '上海市', '天津市', '重庆市'].includes(parentNode.areaName)
            level = isMunicipality ? 'district' : 'city'
          } else {
            level = 'district'
          }

          // 3. 构建四级编码
          const codes: AreaLevelCodes = {
            countryCode: '',
            provinceCode: '',
            cityCode: '',
            districtCode: '',
          }

          // 根据路径填充编码
          if (pathLength >= 1) {
            codes.countryCode = path[0].areaCode
          }

          if (pathLength >= 2) {
            codes.provinceCode = path[1].areaCode
          }

          if (pathLength >= 3) {
            const parentNode = path[1]
            const isMunicipality = parentNode.areaName.includes('直辖市')
              || ['北京市', '上海市', '天津市', '重庆市'].includes(parentNode.areaName)

            if (isMunicipality) {
              // 直辖市：cityCode 为空，districtCode = 当前节点
              codes.cityCode = ''
              codes.districtCode = path[2].areaCode
            } else {
              codes.cityCode = path[2].areaCode
            }
          }

          if (pathLength >= 4) {
            codes.districtCode = path[3].areaCode
          }

          // 如果是区级但还没设置 districtCode，设置为当前节点
          if (level === 'district' && !codes.districtCode) {
            codes.districtCode = node.areaCode
          }

          return {
            codes,
            node,
            path,
            pathNames: path.map((n) => n.areaName),
            level,
          }
        }
        const selectedNode = getAreaLevelInfo(val, areaTreeData.value)

        if (selectedNode != null) {
          form.zipCode = selectedNode.node?.zipCode || ''
          form.fullNamePath = selectedNode.node?.fullNamePath || ''
          form.countryCode = selectedNode.codes.countryCode || ''
          form.provinceCode = selectedNode.codes.provinceCode || ''
          form.cityCode = selectedNode.codes.cityCode || ''
          form.districtCode = selectedNode.codes.districtCode || ''
        }
      },
    },
  },
  {
    label: '',
    field: 'fullNamePath',
    type: 'input',
    span: 12,
    props: {
      readonly: false,
      allowClear: false,
      placeholder: '',
      maxLength: 0,
      disabled: true,
    },
  },
  {
    label: '单位类型',
    field: 'companyTypeCode',
    type: 'select',
    span: 24,
    props: {
      options: company_type,
    },
    required: true,
  },

  {
    label: '统一社会信用代码',
    field: 'creditCode',
    type: 'input',
    span: 12,
  },
  {
    label: '法定代表人',
    field: 'legalPerson',
    type: 'input',
    span: 12,
  },
  {
    label: '注册资本(元)',
    field: 'registerCapital',
    type: 'input',
    span: 12,
  },
  {
    label: '开户银行',
    field: 'bankName',
    type: 'input',
    span: 12,
  },
  {
    label: '银行账号',
    field: 'bankAccount',
    type: 'input',
    span: 12,
  },
  {
    label: '适用税率',
    field: 'taxRate',
    type: 'input',
    span: 12,
  },
  {
    label: '注册地址',
    field: 'registerAddress',
    type: 'input',
    span: 24,
  },
  {
    label: '经营地址',
    field: 'businessAddress',
    type: 'input',
    span: 24,
  },
  {
    label: '主要联系人',
    field: 'mainContact',
    type: 'input',
    span: 12,
  },
  {
    label: '联系人手机号',
    field: 'contactMobile',
    type: 'input',
    span: 12,
  },
  {
    label: '联系人邮箱',
    field: 'contactEmail',
    type: 'input',
    span: 12,
  },
  {
    label: '固定电话',
    field: 'contactTel',
    type: 'input',
    span: 12,
  },
  {
    label: '备注',
    field: 'remark',
    type: 'textarea',
    props: {
      placeholder: '请输入单位备注信息',
      autoSize: true,
    },
    span: 24,
  },
])

// 手动加载省份数据
const loadProvinceData = async () => {
  try {
    const { data } = await listArea({ parentCode: '0', level: 0 })
    areaTreeData.value = data.map((item) => ({
      ...item,
      isLeaf: false, // 省份可以展开
      level: 0,
      children: [], // ⚠️ 必须设为空数组，才会显示展开箭头
    }))
  } catch (error) {
    console.error('加载失败:', error)
    Message.error('加载地区数据失败')
  }
}

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
    // 处理多选框值
    form.cooperationModel = form.cooperationModelArr.reduce((a, b) => a + b, 0) // 位运算合并值

    if (isUpdate.value) {
      await updateCompany(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCompany(form)
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
  // 等待模态框完全渲染
  await nextTick()
  // 手动加载数据
  await loadProvinceData()
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getCompany(id)
  // 加载省份数据
  await loadProvinceData()

  // 2. 等待 DOM 更新，确保 tree-select 组件已渲染
  await nextTick()

  // 3. 加载完整的区域路径
  if (data.provinceCode && data.cityCode && data.districtCode) {
    // 找到国家节点（中国，代码 100000）
    const countryNode = areaTreeData.value[0] // 假设只有中国一个节点

    if (countryNode) {
      // 加载国家节点的子节点（省份）
      const provinceNodes = await columns[2].props?.loadMore(countryNode)

      if (provinceNodes) {
        // 查找目标省份节点
        const provinceNode = provinceNodes.find(
          (node: any) => node.areaCode === data.provinceCode,
        )

        if (provinceNode && data.cityCode) {
          // 加载该省份的城市节点
          const cityNodes = await columns[2].props?.loadMore(provinceNode)

          if (cityNodes && data.cityCode) {
            // 查找目标城市节点
            const cityNode = cityNodes.find(
              (node: any) => node.areaCode === data.cityCode,
            )

            if (cityNode && data.districtCode) {
              // 加载该城市的区县节点
              await columns[2].props?.loadMore(cityNode)
            }
          }
        }
      }
    }
  }
  // 4. 填充表单数据
  Object.assign(form, data)
  // 处理多选框值
  const cooperationValues: number[] = []
  cooperationOptions.forEach((option) => {
    if ((data.cooperationModel & option.value) !== 0) {
      cooperationValues.push(option.value)
    }
  })
  form.cooperationModelArr = cooperationValues

  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
  /* 原有样式 + tree-select 适配 */
.loading-icon {
  width: 24px;
  height: 24px;
}
.custom-empty {
  color: #999;
  padding: 20px;
  text-align: center;
}

/* 表单标签 + 必填星号 */
.form-label {
  display: inline-block;
  margin-right: 8px;
  font-size: 14px;
  line-height: 32px; /* 和 tree-select 高度对齐 */
}
.form-label.required::before {
  content: '*';
  color: #f53f3f;
  margin-right: 4px;
}

/* tree-select 样式适配 */
:deep(.arco-tree-select) {
  width: 100%;
}
</style>
