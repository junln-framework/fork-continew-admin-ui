<template>
  <div class="permission-area">
    <!-- 区域选择器 -->
    <div class="area-selector">
      <a-alert>
        <template v-if="checkedKeys.length > 0">
          已选中 {{ checkedKeys.length }} 条记录
        </template>
        <template v-else>未选中任何记录</template>
        <template v-if="checkedKeys.length > 0" #action>
          <a-link @click="clearAll">清空</a-link>
        </template>
      </a-alert>
    </div>
    <!-- 区域树 -->
    <div class="area-tree">
      <a-tree
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        checkable
        :data="areaTreeData"
        :selectable="true"
        :show-line="true"
        :check-strictly="true"
        :multiple="true"
        :lazy="true"
        :load-more="loadAreaTree"
        @select="handleNodeClick"
        @check="handleCheck"
      >
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { TreeNodeData } from '@arco-design/web-vue/es/tree/interface'
import { listArea } from '@/apis/system/area'
import type { AreaLevelCodes, AreaResp } from '@/apis/system/type'

const props = defineProps({
  areaCode: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['select-area-code'])

interface AreaTreeNodeData extends TreeNodeData {
  level?: number // 区域层级
  fullNamePath?: string // 完整路径
}
// 添加标志位
const isInitializing = ref(false)
const areaTreeData = ref<AreaTreeNodeData[]>([])
const checkedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const parseAreaCodes = () => {
  if (!props.areaCode) return []
  return props.areaCode.split(',').map((code) => code.trim()).filter((code) => code)
}
watch(checkedKeys, (newKeys) => {
  // 如果是初始化阶段，不触发emit
  if (isInitializing.value) return
  emit('select-area-code', { key: newKeys, areaTreeData: areaTreeData.value })
}, { deep: true })

const handleNodeClick = (selectedKeys, data) => {
  const node = data.node
  if (!node.key) return
  const isChecked = checkedKeys.value.includes(node.key)
  if (isChecked) {
    checkedKeys.value = checkedKeys.value.filter((key) => key !== node.key)
  } else {
    checkedKeys.value = [...checkedKeys.value, node.key]
  }
}
const removeItemByKey = (key) => {
  checkedKeys.value = checkedKeys.value.filter((k) => k !== key)
}
const loadAreaTree = async (node: any) => {
  if (node.isLeaf) {
    return []
  }
  const level = node.level + 1
  const parentCode = node.key
  const { data } = await listArea({ parentCode, level })
  const newNodes: AreaTreeNodeData[] = data.map((item) => ({
    key: item.areaCode,
    title: item.areaName,
    isLeaf: level >= 3,
    level,
    selectable: true,
    children: level < 3 ? [] : undefined,
    fullNamePath: item.fullNamePath,
  }))

  const updateNodeChildren = (nodes: AreaTreeNodeData[], targetNode: any, newChildren: AreaTreeNodeData[]) => {
    for (const n of nodes) {
      if (n.key === targetNode.key) {
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
  updateNodeChildren(areaTreeData.value, node, newNodes)
  areaTreeData.value = [...areaTreeData.value]

  // 检查是否需要选中新加载的节点
  const areaCodes = parseAreaCodes()
  const newCheckedKeys = [...checkedKeys.value]
  newNodes.forEach((node) => {
    if (areaCodes.includes(node.key as string) && !newCheckedKeys.includes(node.key as string)) {
      newCheckedKeys.push(node.key as string)
    }
  })
  if (newCheckedKeys.length !== checkedKeys.value.length) {
    // 设置初始化标志，避免触发emit
    isInitializing.value = true
    checkedKeys.value = newCheckedKeys
    // 重置标志位
    nextTick(() => {
      isInitializing.value = false
    })
  }

  return newNodes
}
const loadCountryProvinceData = async () => {
  try {
    const { data: countries } = await listArea({ parentCode: '0', level: 0 })
    const treeData: AreaTreeNodeData[] = []
    const areaCodes = parseAreaCodes()
    for (const country of countries) {
      const countryNode: AreaTreeNodeData = {
        key: country.areaCode,
        title: country.areaName,
        isLeaf: false,
        children: [],
        level: country.level,
        selectable: true,
        fullNamePath: country.fullNamePath,
      }
      try {
        const { data: provinces } = await listArea({
          parentCode: country.areaCode,
          level: 1,
        })
        countryNode.children = provinces.map((province) => ({
          key: province.areaCode,
          title: province.areaName,
          isLeaf: false,
          children: [],
          selectable: true,
          level: province.level,
          fullNamePath: province.fullNamePath,
        }))
      } catch (error) {
        console.error(`加载 ${country.areaName} 的子节点失败:`, error)
      }
      treeData.push(countryNode)
    }
    areaTreeData.value = treeData
    areaTreeData.value = [...areaTreeData.value]
    expandedKeys.value = countries.map((item) => item.areaCode)

    // 设置初始选中的节点
    if (areaCodes.length > 0) {
      // 首先选中已经加载的节点（国家和省份）
      const initialCheckedKeys: string[] = []

      // 递归查找节点
      const findAndCheckNodes = (nodes: AreaTreeNodeData[]) => {
        for (const node of nodes) {
          if (areaCodes.includes(node.key as string)) {
            initialCheckedKeys.push(node.key as string)
          }
          if (node.children && node.children.length > 0) {
            findAndCheckNodes(node.children)
          }
        }
      }
      findAndCheckNodes(areaTreeData.value)
      // 设置初始化标志，避免触发emit
      isInitializing.value = true
      checkedKeys.value = initialCheckedKeys
      // 重置标志位
      nextTick(() => {
        isInitializing.value = false
      })
    }
  } catch (error) {
    console.error('加载失败:', error)
    Message.error('加载地区数据失败')
  }
}
onMounted(() => {
  loadCountryProvinceData()
})

const handleCheck = (checkedKeysValue) => {
  console.error(checkedKeysValue)
  checkedKeys.value = checkedKeysValue
}

const clearAll = () => {
  checkedKeys.value = []
}
defineExpose({
  removeItemByKey,
})
</script>

<style scoped>
      :deep(.area-selector) {
    padding: 2px;
  }
</style>
