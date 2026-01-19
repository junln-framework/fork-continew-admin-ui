<!-- AddModal.vue 修复后的完整代码 -->
<template>
  <a-modal
    v-model:visible="visible"
    :title="`权限分配:${selectedUserName}`"
    :width="width > 768 ? '85%' : '95%'"
    unmount-on-close
    :body-style="{ maxHeight: '80vh', overflow: 'auto', padding: '16px' }"
  >
    <a-space direction="vertical" :size="16" style="display: block;">
      <a-row class="grid">
        <a-col :span="12">
          <div class="permission-tabs" style="height: 80vh; overflow: auto;">
            <a-tabs
              v-model="activeTab"
              type="card"
              :tab-bar-gutter="8"
              @change="handleTabChange"
            >
              <!-- 区域权限 -->
              <a-tab-pane key="area" title="区域权限">
                <PermissionArea
                  ref="permissionAreaRef"
                  :area-code="permissionReq.areas"
                  @select-area-code="handlePermissionChange('area', $event)"
                />
              </a-tab-pane>

              <!-- 单位权限 -->
              <a-tab-pane key="company" title="单位权限">
                <PermissionCompany
                  ref="permissionCompanyRef"
                  :company-code="permissionReq.companies"
                  @select-company-code="handlePermissionChange('company', $event)"
                />
              </a-tab-pane>

              <!-- 联系人权限 -->
              <a-tab-pane key="contacts" title="联系人权限">
                <PermissionContacts
                  ref="permissionContactsRef"
                  :contact-code="permissionReq.contacts"
                  @select-contact-code="handlePermissionChange('contacts', $event)"
                />
              </a-tab-pane>

              <!-- 权限预览 -->
              <a-tab-pane v-if="false" key="preview" title="权限预览">
                <PermissionPreview />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-col>
        <a-col :span="12">
          <GiTable
            :data="selectDataList"
            :columns="selectColumns"
            :disabled-tools="['refresh', 'size', 'fullscreen', 'setting']"
            :scroll="{ x: '100%', y: '100%' }"
          >
            <template #permissionType="{ record }">
              <a-tag v-if="record.level === 0" color="red">{{ record.permissionType }}</a-tag>
              <a-tag v-else-if="record.level === 1" color="orange">{{ record.permissionType }}</a-tag>
              <a-tag v-else-if="record.level === 2" color="green">{{ record.permissionType }}</a-tag>
              <a-tag v-else-if="record.level === 10" color="arcoblue">{{ record.permissionType }}</a-tag>
              <a-tag v-else-if="record.level === 20" color="magenta">{{ record.permissionType }}</a-tag>
              <a-tag v-else color="gray">{{ record.permissionType }}</a-tag>
            </template>
            <template #action="{ record }">
              <a-button
                status="danger"
                size="mini" @click="() => handleRemoveItem(record)"
              >
                <icon-delete />
              </a-button>
            </template>
          </GiTable>
        </a-col>
      </a-row>
    </a-space>
    <!-- 保存按钮使用 a-popconfirm -->
    <template #footer>
      <a-space>
        <a-button @click="visible = false">取消</a-button>
        <!-- 使用 a-popconfirm 包裹保存按钮 -->
        <a-popconfirm
          v-if="!hasAnyPermission"
          content="当前没有任何权限，确定要清空所有权限吗？"
          position="tr"
          type="warning"
          ok-text="清空" cancel-text="关闭"
          @ok="handleSave"
          @cancel="handleCancelConfirm"
        >
          <a-button type="primary">保存权限</a-button>
        </a-popconfirm>

        <!-- 有权限时直接保存 -->
        <a-button
          v-else
          type="primary"
          @click="handleSave"
        >
          保存权限
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, Modal, type TableInstance } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { reactive, ref } from 'vue'
import type { TreeNodeData } from '@arco-design/web-vue/es/tree/interface'
// 导入组件
import PermissionArea from './components/PermissionArea.vue'
import PermissionCompany from './components/PermissionCompany.vue'
import PermissionContacts from './components/PermissionContacts.vue'
import PermissionPreview from './components/PermissionPreview.vue'
import { type PermissionReq, type UserPermissionDataResp, getPermissionUserReq, getUserPermissionsSelected, saveUserPermissions } from '@/apis/system/permissionUser'

const activeTab = ref('area')
const visible = ref(false)
const { width } = useWindowSize()

interface AreaTreeNodeData extends TreeNodeData {
  level?: number // 区域层级
  fullNamePath?: string // 完整路径
  id?: number | string // 区域ID
}

const permissionReq: PermissionReq = {
  userId: undefined,
  areas: '',
  companies: '',
  contacts: '',
}
const selectedUserName = ref<string>('')

const permissionAreaRef = ref()
const permissionCompanyRef = ref()
const permissionContactsRef = ref()
const selectDataList = ref<UserPermissionDataResp[]>([])

// 权限变更记录
const permissionChanges = reactive({
  area: [],
  company: [],
  contacts: [],
})

const selectColumns: TableInstance['columns'] = [
  {
    title: '#',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1),
  },
  { title: '权限类型', dataIndex: 'permissionType', slotName: 'permissionType', align: 'center', minWidth: 80, ellipsis: true, tooltip: true, width: 110 },
  { title: '区域/单位/联系人', dataIndex: 'info', ellipsis: true, tooltip: true },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 100,
    align: 'center',
  },
]

// 处理标签页切换
const handleTabChange = (key) => {
  console.warn('切换到标签页:', key)
}
const findNodeByKey = (selected: UserPermissionDataResp[], treeData: AreaTreeNodeData[], searchKeys) => {
  const results: UserPermissionDataResp[] = []
  // 先将selected中已经存在的searchKeys加入results
  selected.forEach((item) => {
    if (searchKeys.includes(item.code)) {
      results.push(item)
    }
  })
  const searchRecursive = (nodes: AreaTreeNodeData[]) => {
    for (const node of nodes) {
      // 如果当前节点的key在searchKeys数组中
      if (searchKeys.includes(node.key)) {
        const permissionType = node.level === 1
          ? '区域(省份)'
          : node.level === 2
            ? '区域(城市)'
            : node.level === 3 ? '区域(区县)' : '顶级区域'
        results.push({
          permissionType,
          info: node.fullNamePath as string,
          id: node.key as string,
          code: node.key as string,
          type: 'area',
          level: node.level,
        })
      }

      // 如果有子节点，递归搜索子节点
      if (node.children && node.children.length > 0) {
        searchRecursive(node.children)
      }
    }
  }
  searchRecursive(treeData)
  return results
}

const handlePermissionChange = (type, selected) => {
  switch (type) {
    case 'area': {
      permissionChanges[type] = Array.isArray(selected.key) ? selected.key : [selected.key]
      // 获取新选择的区域数据
      const newAreaData = findNodeByKey(selectDataList.value, selected.areaTreeData, selected.key)
      // 1. 先移除该类型的所有现有数据
      const otherTypesData = selectDataList.value.filter((item) => item.type !== type)
      // 2. 添加新选择的区域数据
      selectDataList.value = [...otherTypesData, ...newAreaData]
    }
      break
    case 'company': {
      permissionChanges[type] = selected.key
      const otherTypesData = selectDataList.value.filter((item) => item.type !== type)
      const newCompanyData = selected.key.map((companyCode) => {
        const company = selected.companyTreeData.find((comp) => comp.companyCode === companyCode)
        return {
          permissionType: '单位',
          info: company ? company.companyName : '未知单位',
          id: company ? company.id : '',
          code: company ? company.companyCode : '',
          type: 'company',
          level: 10,
        }
      })
      selectDataList.value = [...otherTypesData, ...newCompanyData]
      break
    }
    case 'contacts': {
      permissionChanges[type] = selected.key
      const otherTypesData = selectDataList.value.filter((item) => item.type !== type)
      const newContactData = selected.key.map((contactCode) => {
        const contact = selected.contactList.find((cont) => cont.contactCode === contactCode)
        return {
          permissionType: '联系人',
          info: contact ? `${contact.companyName} / ${contact.contactName}` : '未知联系人',
          id: contact ? contact.id : '',
          code: contact ? contact.contactCode : '',
          type: 'contacts',
          level: 20,
        }
      })
      selectDataList.value = [...otherTypesData, ...newContactData]
      break
    }
  }
  selectDataList.value = [...selectDataList.value]
  console.warn(`${type}权限变更:`, selected)
}
// 移除方法
const handleRemoveItem = (record: UserPermissionDataResp) => {
  // 2. 更新树形组件的选中状态
  if (record.type === 'area' && record.id && permissionAreaRef.value) {
    selectDataList.value = selectDataList.value.filter((item) => item.id !== record.code)
    permissionAreaRef.value.removeItemByKey(record.code)
    if (permissionChanges?.area) {
      permissionChanges.area = [...permissionChanges.area.filter((key) => key !== record.code)]
    }
  }
  if (record.type === 'company' && record.id) {
    selectDataList.value = selectDataList.value.filter((item) => item.id !== record.id)
    permissionCompanyRef.value.removeItemByKey(record.id)
    if (permissionChanges?.company) {
      permissionChanges.company = [...permissionChanges.company.filter((key) => key !== record.id)]
    }
  }
  if (record.type === 'contacts' && record.id) {
    selectDataList.value = selectDataList.value.filter((item) => item.id !== record.id)
    permissionContactsRef.value.removeItemByKey(record.id)
    if (permissionChanges?.contacts) {
      permissionChanges.contacts = [...permissionChanges.contacts.filter((key) => key !== record.id)]
    }
  }
}
// 加载用户权限
const loadUserPermissions = async () => {
  if (!permissionReq.userId) return
  getUserPermissionsSelected(permissionReq.userId).then((res) => {
    if (res.success) {
      selectDataList.value = res.data
      selectDataList.value = [...selectDataList.value]
    }
  }).catch((error) => {
    console.error('加载用户权限失败:', error)
    Message.error('加载用户权限失败')
  })
}
const handleSave = async () => {
  // 构建权限字符串
  const areas = selectDataList.value
    .filter((item) => item.type === 'area')
    .map((item) => item.code)
    .join(',')

  const companies = selectDataList.value
    .filter((item) => item.type === 'company')
    .map((item) => item.code)
    .join(',')

  const contacts = selectDataList.value
    .filter((item) => item.type === 'contacts')
    .map((item) => item.code)
    .join(',')

  const saveReq = {
    userId: permissionReq.userId,
    areas,
    companies,
    contacts,
  }

  try {
    await saveUserPermissions(saveReq)
    Message.success('保存成功')

    // 更新permissionReq
    permissionReq.areas = areas
    permissionReq.companies = companies
    permissionReq.contacts = contacts

    // 清空变更记录
    Object.keys(permissionChanges).forEach((key) => {
      permissionChanges[key] = []
    })

    // 关闭弹框
    visible.value = false
  } catch (error) {
    console.error('保存权限失败:', error)
    Message.error('保存权限失败')
  }
}

const handleCancelConfirm = () => {
  console.warn('用户取消了保存操作')
}
const hasAnyPermission = computed(() => {
  const areas = selectDataList.value
    .filter((item) => item.type === 'area')
    .map((item) => item.code)
    .join(',')

  const companies = selectDataList.value
    .filter((item) => item.type === 'company')
    .map((item) => item.code)
    .join(',')

  const contacts = selectDataList.value
    .filter((item) => item.type === 'contacts')
    .map((item) => item.code)
    .join(',')

  return !!(areas || companies || contacts)
})

// 重置权限
const resetPermissions = () => {
  if (permissionReq.userId) {
    loadUserPermissions()
  } else {
    permissionReq.areas = ''
    permissionReq.companies = ''
    permissionReq.contacts = ''
    Object.keys(permissionChanges).forEach((key) => {
      permissionChanges[key] = []
    })
  }
  Message.info('权限已重置')
}

// 新增
const onInitData = (userId: string, info: string) => {
  permissionReq.userId = userId
  getPermissionUserReq(userId).then((res) => {
    visible.value = true
    permissionReq.areas = res.data.areas
    permissionReq.companies = res.data.companies
    permissionReq.contacts = res.data.contacts
    loadUserPermissions()
  }).catch((error) => {
    console.error('获取用户权限失败:', error)
    Message.error('获取用户权限失败')
  })
  selectedUserName.value = info
}

defineExpose({ onInitData })
</script>

<style scoped>
.grid {
  :deep(.arco-tabs-content) {
    padding-top: 6px;
  }
  :deep(.arco-row-align-center){
    margin-top: 4px;
  }
}

/* 补充样式，避免内容溢出 */
.permission-management {
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 64px);
}

.user-selector {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.permission-tabs {
  margin-bottom: 24px;
  /* 新增：固定最大高度，超出滚动 */
  max-height: 70vh;
  overflow-y: auto;
}

.action-bar {
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  text-align: center;
}
</style>
