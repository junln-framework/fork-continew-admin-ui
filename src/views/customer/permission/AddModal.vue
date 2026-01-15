<!-- AddModal.vue 修复后的完整代码 -->
<template>
  <a-modal
    v-model:visible="visible"
    :title="`权限分配:${selectedUserName}`"
    :width="width > 768 ? '85%' : '95%'"
    unmount-on-close
    ok-text="保存权限"
    cancel-text="关闭"
    :body-style="{ maxHeight: '80vh', overflow: 'auto', padding: '16px' }"
    @ok="save"
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
              <a-tab-pane key="preview" title="权限预览">
                <PermissionPreview
                  :area-permissions="areaPermissions"
                  :company-permissions="companyPermissions"
                  :contact-permissions="contactPermissions"
                />
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
  </a-modal>
</template>

<script setup lang="ts">
import { Message, type TableInstance } from '@arco-design/web-vue'
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
}

const permissionReq: PermissionReq = {
  userId: undefined,
  areas: '',
  companies: '',
  contacts: '',
}
const selectedUserName = ref<string>('')
// 权限数据
const areaPermissions = ref([])
const companyPermissions = ref([])
const contactPermissions = ref([])

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
const findNodeByKey = (treeData: AreaTreeNodeData[], searchKeys) => {
  const results: UserPermissionDataResp[] = []
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
          id: node.key,
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
      const newAreaData = findNodeByKey(selected.areaTreeData, selected.key)
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
  // 1. 从表格中移除数据
  selectDataList.value = selectDataList.value.filter((item) => item.id !== record.id)
  // 2. 更新树形组件的选中状态
  if (record.type === 'area' && record.id && permissionAreaRef.value) {
    permissionAreaRef.value.removeItemByKey(record.id)
    if (permissionChanges?.area) {
      permissionChanges.area = [...permissionChanges.area.filter((key) => key !== record.id)]
    }
  }
  if (record.type === 'company' && record.id) {
    permissionCompanyRef.value.removeItemByKey(record.id)
    if (permissionChanges?.company) {
      permissionChanges.company = [...permissionChanges.company.filter((key) => key !== record.id)]
    }
  }
  if (record.type === 'contacts' && record.id) {
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
// 保存所有权限
const save = async () => {
  if (!permissionReq.userId) {
    Message.warning('请先选择用户')
    return
  }
  const areas = permissionChanges.area.length > 0 ? permissionChanges.area.join(',') : ''
  const companies = permissionChanges.company.length > 0 ? permissionChanges.company.join(',') : ''
  const contacts = permissionChanges.contacts.length > 0 ? permissionChanges.contacts.join(',') : ''

  if (permissionChanges.area.length === 0 && permissionChanges.company.length === 0 && permissionChanges.contacts.length === 0) {
    Message.warning('没有权限变更需要保存')
    return
  }
  permissionReq.areas = areas
  permissionReq.companies = companies
  permissionReq.contacts = contacts

  try {
    console.error('保存权限:', permissionReq)
    await saveUserPermissions(permissionReq)
    Message.success('保存成功')
  } catch (error) {
    console.error('保存权限失败:', error)
    Message.error('保存权限失败')
  }
}

// 重置权限
const resetPermissions = () => {
  if (permissionReq.userId) {
    loadUserPermissions()
  } else {
    areaPermissions.value = []
    companyPermissions.value = []
    contactPermissions.value = []
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
