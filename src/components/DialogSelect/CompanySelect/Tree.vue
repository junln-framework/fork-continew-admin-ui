<template>
  <div class="permission-area">
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

const emit = defineEmits(['select-area-code'])

interface AreaTreeNodeData extends TreeNodeData {
  level?: number // 区域层级
  fullNamePath?: string // 完整路径
}
const areaTreeData = ref<AreaTreeNodeData[]>([])
const checkedKeys = ref<(string | number)[]>([])
const expandedKeys = ref<string[]>([])

watch(checkedKeys, (newKeys) => {
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
  // 找到父节点并更新其 children
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
  return newNodes
}
const loadCountryProvinceData = async () => {
  try {
    const { data: countries } = await listArea({ parentCode: '0', level: 0 })
    const treeData: AreaTreeNodeData[] = []
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
  } catch (error) {
    console.error('加载失败:', error)
    Message.error('加载地区数据失败')
  }
}
onMounted(() => {
  loadCountryProvinceData()
})

// 处理选中事件
const handleCheck = (checkedKeysValue) => {
  console.error(checkedKeysValue)
  checkedKeys.value = checkedKeysValue
}

// 清空选择
const clearAll = () => {
  checkedKeys.value = []
}
</script>

<style scoped>

</style>
