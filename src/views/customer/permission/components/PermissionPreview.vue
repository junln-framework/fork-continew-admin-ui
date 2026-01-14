<template>
  <div class="permission-preview">
    <!-- 权限概览 -->
    <div class="preview-header">
      <h3>权限分配预览</h3>
      <p>以下是当前用户的所有权限分配情况</p>
    </div>

    <!-- 区域权限预览 -->
    <div class="preview-section">
      <div class="section-header">
        <h4>区域权限</h4>
        <a-tag color="arcoblue">{{ areaPermissions.length }} 个区域</a-tag>
      </div>

      <div class="section-content">
        <template v-if="areaPermissions.length > 0">
          <div class="permission-grid">
            <a-card
              v-for="area in areaPermissions.slice(0, 10)"
              :key="area.id"
              size="small"
              class="permission-card"
            >
              <template #title>
                <IconEnvironment style="margin-right: 8px" />
                {{ area.name }}
              </template>
              <div class="card-content">
                <div class="card-info">
                  <span class="info-label">编码:</span>
                  <span class="info-value">{{ area.code }}</span>
                </div>
              </div>
            </a-card>
          </div>

          <div v-if="areaPermissions.length > 10" class="more-info">
            <a-button type="text" size="small">
              查看更多区域 ({{ areaPermissions.length - 10 }})
            </a-button>
          </div>
        </template>
        <template v-else>
          <a-empty description="暂无区域权限" />
        </template>
      </div>
    </div>

    <!-- 单位权限预览 -->
    <div class="preview-section">
      <div class="section-header">
        <h4>单位权限</h4>
        <a-tag color="green">{{ companyPermissions.length }} 个单位</a-tag>
      </div>

      <div class="section-content">
        <template v-if="companyPermissions.length > 0">
          <a-table
            :data="companyPermissions.slice(0, 5)"
            :columns="companyColumns"
            size="small"
            :pagination="false"
          >
            <template #type="{ record }">
              <a-tag :color="getCompanyTypeColor(record.type)">
                {{ getCompanyTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table>

          <div v-if="companyPermissions.length > 5" class="more-info">
            <a-button type="text" size="small">
              查看更多单位 ({{ companyPermissions.length - 5 }})
            </a-button>
          </div>
        </template>
        <template v-else>
          <a-empty description="暂无单位权限" />
        </template>
      </div>
    </div>

    <!-- 联系人权限预览 -->
    <div class="preview-section">
      <div class="section-header">
        <h4>联系人权限</h4>
        <a-tag color="orange">{{ contactPermissions.length }} 个联系人</a-tag>
      </div>

      <div class="section-content">
        <template v-if="contactPermissions.length > 0">
          <div class="contact-list">
            <div
              v-for="contact in contactPermissions.slice(0, 8)"
              :key="contact.id"
              class="contact-item"
            >
              <a-avatar size="small" :src="contact.avatar">
                {{ contact.name.charAt(0) }}
              </a-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-code">{{ contact.code }}</div>
              </div>
            </div>
          </div>

          <div v-if="contactPermissions.length > 8" class="more-info">
            <a-button type="text" size="small">
              查看更多联系人 ({{ contactPermissions.length - 8 }})
            </a-button>
          </div>
        </template>
        <template v-else>
          <a-empty description="暂无联系人权限" />
        </template>
      </div>
    </div>

    <!-- 权限统计 -->
    <div class="preview-summary">
      <a-card title="权限统计" size="small">
        <a-space direction="vertical" size="large">
          <div class="summary-item">
            <div class="summary-label">区域权限:</div>
            <div class="summary-value">{{ areaPermissions.length }} 个</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">单位权限:</div>
            <div class="summary-value">{{ companyPermissions.length }} 个</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">联系人权限:</div>
            <div class="summary-value">{{ contactPermissions.length }} 个</div>
          </div>
          <div class="summary-item total">
            <div class="summary-label">总计:</div>
            <div class="summary-value">
              {{ areaPermissions.length + companyPermissions.length + contactPermissions.length }} 个权限
            </div>
          </div>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  areaPermissions: {
    type: Array,
    default: () => [],
  },
  companyPermissions: {
    type: Array,
    default: () => [],
  },
  contactPermissions: {
    type: Array,
    default: () => [],
  },
})

// 单位表格列配置
const companyColumns = [
  {
    title: '单位名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: '单位编码',
    dataIndex: 'code',
    key: 'code',
    width: 100,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 80,
    slotName: 'type',
  },
]

// 获取单位类型颜色
const getCompanyTypeColor = (type) => {
  const colorMap = {
    supplier: 'arcoblue',
    customer: 'green',
    partner: 'orange',
  }
  return colorMap[type] || 'default'
}

// 获取单位类型文本
const getCompanyTypeText = (type) => {
  const textMap = {
    supplier: '供应商',
    customer: '客户',
    partner: '合作伙伴',
  }
  return textMap[type] || '其他'
}
</script>

<style scoped>
.permission-preview {
  padding: 16px;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.preview-header {
  margin-bottom: 24px;
  text-align: center;
}

.preview-header h3 {
  margin-bottom: 8px;
  color: var(--color-text-1);
}

.preview-header p {
  color: var(--color-text-3);
}

.preview-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--color-bg-1);
  border-radius: 4px;
  border: 1px solid var(--color-border-2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  color: var(--color-text-1);
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.permission-card {
  transition: all 0.3s;
}

.permission-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 8px 0;
}

.card-info {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.info-label {
  color: var(--color-text-3);
  margin-right: 8px;
  font-size: 12px;
}

.info-value {
  color: var(--color-text-2);
  font-size: 12px;
}

.contact-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: var(--color-bg-2);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.contact-item:hover {
  background: var(--color-fill-2);
}

.contact-info {
  margin-left: 12px;
}

.contact-name {
  font-size: 14px;
  color: var(--color-text-1);
  margin-bottom: 2px;
}

.contact-code {
  font-size: 12px;
  color: var(--color-text-3);
}

.more-info {
  text-align: center;
  margin-top: 12px;
}

.preview-summary {
  margin-top: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-2);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: bold;
  color: var(--color-text-1);
}

.summary-label {
  color: var(--color-text-2);
}

.summary-value {
  color: var(--color-text-1);
  font-weight: 500;
}
</style>
