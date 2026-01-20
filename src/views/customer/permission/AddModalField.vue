<template>
  <a-modal
    v-model:visible="visible"
    :title="`字段权限分配:${selectedUserName}`"
    :width="width > 768 ? '55%' : '75%'"
    unmount-on-close
    :body-style="{ maxHeight: '80vh', overflow: 'auto', padding: '16px' }"
  >
    <div class="field-config-page">
      <!-- 1. 业务表选择 -->
      <a-select v-model="selectedBusinessTable" placeholder="选择业务表" style="width: 200px; margin-bottom: 20px;" @change="loadFieldMeta">
        <a-option
          v-for="table in tableList"
          :key="table.businessTable"
          :label="table.tableName"
          :value="table.businessTable"
        />
      </a-select>

      <!-- 2. 字段配置区域 -->
      <div v-if="fieldMetaList.length > 0" class="config-panel">
        <div v-for="field in fieldMetaList" :key="field.fieldName" class="field-item">
          <span class="field-label">{{ field.defaultAlias }}</span>
          <a-switch v-model="field.visible" :disabled="!field.allowHide" />
          <a-input v-model="field.defaultAlias" placeholder="字段别名" style="width: 150px;" />
          <a-input-number v-model="field.defaultSort" min="1" style="width: 80px;" />
        </div>

        <a-button type="primary" style="margin-top: 20px;" @click="saveConfig">保存配置</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { type FieldMetaResp, type TableNameResp, batchSaveFieldConfig, getFieldMeta, getTableList, getUserFullConfig } from '@/apis/system/field-visibility'

const visible = ref(false)
const { width } = useWindowSize()
const selectedBusinessTable = ref('')
const tableList = ref<TableNameResp[]>([])
const fieldMetaList = ref<FieldMetaResp[]>([])
const selectedUserId = ref<string | number>('')
const selectedUserName = ref<string>('')
// 选择表后加载字段元数据 + 用户配置
const loadFieldMeta = async () => {
  if (!selectedBusinessTable.value) return
  try {
    // 1. 加载字段元数据
    const metaRes = await getFieldMeta({ businessTable: selectedBusinessTable.value })
    fieldMetaList.value = metaRes.data

    // 2. 加载用户已有配置
    const configRes = await getUserFullConfig({ businessTable: selectedBusinessTable.value, userId: selectedUserId.value })
    const userConfig = configRes.data || {}

    // 3. 合并元数据和用户配置
    fieldMetaList.value = fieldMetaList.value.map((field) => {
      const userField = userConfig[field.fieldName] || {}
      return {
        ...field,
        visible: userField.visible ?? true,
        alias: userField.alias ?? field.defaultAlias,
        sort: userField.sort ?? field.defaultSort,
      }
    })
  } catch (e) {
    Message.error('加载字段配置失败')
  }
}
// 保存配置：组装JSON并提交
const saveConfig = async () => {
  if (!selectedBusinessTable.value) {
    Message.warning('请先选择业务表')
    return
  }
  // 组装JSON格式的配置
  const fieldConfigJson = {}
  fieldMetaList.value.forEach((field) => {
    fieldConfigJson[field.fieldName] = {
      visible: field.visible,
      alias: field.defaultAlias ? field.defaultAlias : '',
      sort: field.defaultSort ? field.defaultSort : 0,
    }
  })

  // 构造请求参数
  const reqData = {
    businessTable: selectedBusinessTable.value,
    configType: 2, // 用户级配置
    configId: selectedUserId.value,
    fieldConfigJson,
  }

  try {
    await batchSaveFieldConfig(reqData)
    Message.success('配置保存成功')
    // 重新加载配置
    loadFieldMeta()
  } catch (e) {
    Message.error('保存配置失败')
  }
}
// 新增
const onInitData = async (userId: string, info: string) => {
  selectedUserId.value = userId
  selectedUserName.value = info
  visible.value = true
  try {
    const res = await getTableList().finally(() => {
      // 清空之前的字段元数据
      fieldMetaList.value = []
      selectedBusinessTable.value = ''
    })
    tableList.value = res.data
    // 设置默认选择第一个业务表
    if (tableList.value.length > 0) {
      selectedBusinessTable.value = tableList.value[0].businessTable
      // 自动加载第一个业务表的字段元数据
      await loadFieldMeta()
    }
  } catch (e) {
    Message.error('加载业务表列表失败')
  }
}

defineExpose({ onInitData })
</script>

<style scoped>
.field-config-page {
    padding: 20px;
}
.config-panel {
    border: 1px solid #e6e6e6;
    padding: 20px;
    border-radius: 4px;
}
.field-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
}
.field-label {
    width: 100px;
    text-align: right;
}
</style>
