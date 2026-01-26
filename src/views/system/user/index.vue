<template>
  <GiPageLayout>
    <template #left>
      <DeptTree ref="deptTreeRef" @node-click="handleSelectDept" />
    </template>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1500 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['nickname']"
      @refresh="search"
    >
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset"></GiForm>
      </template>
      <template #toolbar-left>
        <a-button v-permission="['system:user:create']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button type="primary" icon="el-icon-user-add" @click="openAssignAssistantDialog">
          分配助理
        </a-button>
        <a-button v-permission="['system:user:import']" @click="onImport">
          <template #icon><icon-upload /></template>
          <template #default>导入</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:user:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #nickname="{ record }">
        <GiCellAvatar :avatar="record.avatar" :name="record.nickname" />
      </template>
      <template #gender="{ record }">
        <GiCellGender :gender="record.gender" />
      </template>
      <template #roleNames="{ record }">
        <GiCellTags :data="record.roleNames" />
      </template>
      <template #deptNames="{ record }">
        <GiCellTags :data="record.deptNames" />
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #isSystem="{ record }">
        <a-tag v-if="record.isSystem" color="red" size="small">是</a-tag>
        <a-tag v-else color="arcoblue" size="small">否</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:user:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:user:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-dropdown>
            <a-button v-if="has.hasPermOr(['system:user:resetPwd', 'system:user:updateRole', 'system:user:delete'])" type="text" size="mini" title="更多">
              <template #icon>
                <icon-more :size="16" />
              </template>
            </a-button>
            <template #content>
              <a-doption v-permission="['system:user:resetPwd']" title="重置密码" @click="onResetPwd(record)">重置密码</a-doption>
              <a-doption v-permission="['system:user:updateRole']" :disabled="record.isSystem" title="分配角色" @click="onUpdateRole(record)">分配角色</a-doption>
              <a-doption v-permission="['system:user:delete']">
                <a-link
                  status="danger"
                  :disabled="record.isSystem"
                  :title="record.isSystem ? '系统内置数据不能删除' : '删除'"
                  @click="onDelete(record)"
                >
                  删除
                </a-link>
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </GiTable>

    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <ImportDrawer ref="ImportDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
    <PwdResetModal ref="PwdResetModalRef" />
    <RoleUpdateModal ref="RoleUpdateModalRef" @save-success="search" />
    <!-- 分配助理弹窗 -->
    <a-drawer v-model:visible="assignDialogVisible" title="分配助理" width="600px">
      <a-form ref="assignFormRef" :model="assignForm" :rules="assignRules" label-width="100px">
        <!-- 助理用户：可多选 -->
        <a-form-item label="选择助理" prop="assistantUserId">
          <a-select v-model="assignForm.assistantUserId" placeholder="请选择助理" filterable>
            <a-option
              v-for="user in userList" :key="user.id" :label="user.realName" :value="user.id"
              :disabled="user.id === assignForm.assistedUserId"
            />
          </a-select>
        </a-form-item>
        <!-- 被协助人：如果是从列表行点击，默认选中该行用户 -->
        <a-form-item label="被协助人" prop="assistedUserId">
          <a-select v-model="assignForm.assistedUserId" placeholder="请选择被协助人">
            <a-option v-for="user in userList" :key="user.id" :label="user.realName" :value="user.id" />
          </a-select>
        </a-form-item>
        <!-- 过期时间：可选，默认永久 -->
        <a-form-item label="过期时间">
          <a-date-picker
            v-model="assignForm.expireTime"
            type="datetime"
            placeholder="选择过期时间（为空则永久）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="assignDialogVisible = false">取消</a-button>
        <a-button type="primary" @click="submitAssign">确认分配</a-button>
      </template>
    </a-drawer>
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { Message, Modal } from '@arco-design/web-vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DeptTree from './dept/index.vue'
import AddDrawer from './AddDrawer.vue'
import ImportDrawer from './ImportDrawer.vue'
import DetailDrawer from './DetailDrawer.vue'
import PwdResetModal from './PwdResetModal.vue'
import RoleUpdateModal from './RoleUpdateModal.vue'
import { type UserResp, deleteUser, exportUser, listUser } from '@/apis/system/user'
import { assignAssistant, listAssistants, listAssistedUsers, unAssign } from '@/apis/system/user-assistant'
import { DisEnableStatusList } from '@/constant/common'
import { useDownload, useResetReactive, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import type { ColumnItem } from '@/components/GiForm'

defineOptions({ name: 'SystemUser' })

const route = useRoute()
const deptTreeRef = ref() // 部门树组件引用
const userList = ref([]) // 用户列表
const assignDialogVisible = ref(false) // 分配弹窗显隐
const assignFormRef = ref(null) // 表单ref
// 分配表单
const assignForm = reactive({
  assistedUserId: '', // 被协助人ID
  assistantUserId: '', // 助理ID
  expireTime: null, // 过期时间
})

// 表单校验规则
const assignRules = reactive({
  assistedUserId: [{ required: true, message: '请选择被协助人', trigger: 'change' }],
  assistantUserId: [{ required: true, message: '请选择助理用户', trigger: 'change' }],
})

const [queryForm, resetForm] = useResetReactive({
  sort: ['t1.id,desc'],
  deptId: route.query.deptId as string || undefined, // 初始化时设置 deptId
})
const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '姓名',
    field: 'description',
    span: { xs: 24, sm: 8, xxl: 8 },
    props: {
      placeholder: '账号/姓名/描述',
    },
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    span: { xs: 24, sm: 6, xxl: 8 },
    props: {
      options: DisEnableStatusList,
      placeholder: '请选择状态',
    },
  },
  {
    type: 'range-picker',
    label: '创建时间',
    field: 'createTime',
    span: { xs: 24, sm: 10, xxl: 8 },
  },
])

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listUser({ ...queryForm, ...page }), { immediate: false })
const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  {
    title: '姓名',
    dataIndex: 'nickname',
    slotName: 'nickname',
    minWidth: 140,
    ellipsis: true,
    tooltip: true,
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '账号', dataIndex: 'username', slotName: 'username', minWidth: 140, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender', align: 'center' },
  { title: '部门', dataIndex: 'deptNames', slotName: 'deptNames', minWidth: 210 },
  { title: '角色', dataIndex: 'roleNames', slotName: 'roleNames', minWidth: 165 },
  { title: '手机号', dataIndex: 'phone', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '邮箱', dataIndex: 'email', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '系统内置', dataIndex: 'isSystem', slotName: 'isSystem', width: 100, align: 'center', show: false },
  { title: '描述', dataIndex: 'description', minWidth: 130, ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr([
      'system:user:get',
      'system:user:update',
      'system:user:resetPwd',
      'system:user:updateRole',
      'system:user:delete',
    ]),
  },
]

// 重置
const reset = () => {
  resetForm()
  search()
}

// 删除
const onDelete = (record: UserResp) => {
  return handleDelete(() => deleteUser(record.id), {
    content: `是否确定删除用户「${record.nickname}(${record.username})」？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportUser(queryForm))
}

const ImportDrawerRef = ref<InstanceType<typeof ImportDrawer>>()
// 导入
const onImport = () => {
  ImportDrawerRef.value?.onOpen()
}

const AddDrawerRef = ref<InstanceType<typeof AddDrawer>>()
// 新增
const onAdd = () => {
  AddDrawerRef.value?.onAdd()
}

// 修改
const onUpdate = (record: UserResp) => {
  AddDrawerRef.value?.onUpdate(record.id)
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: UserResp) => {
  DetailDrawerRef.value?.onOpen(record.id)
}

const PwdResetModalRef = ref<InstanceType<typeof PwdResetModal>>()
// 重置密码
const onResetPwd = (record: UserResp) => {
  PwdResetModalRef.value?.onOpen(record.id)
}

const RoleUpdateModalRef = ref<InstanceType<typeof RoleUpdateModal>>()
// 分配角色
const onUpdateRole = (record: UserResp) => {
  RoleUpdateModalRef.value?.onOpen(record.id)
}
// 选中部门树节点的方法
const selectDeptTreeNode = (deptId: string) => {
  if (deptTreeRef.value) {
    // 通过 ref 直接设置 selectedKeys
    deptTreeRef.value.selectedKeys = [deptId]

    // 如果需要展开父节点，可以调用 expandAll
    deptTreeRef.value.expandAll?.(true)

    // 触发节点点击事件，确保其他逻辑正常执行
    deptTreeRef.value.select?.([deptId])
  }
}
const openAssignAssistantDialog = (assistedUserId) => {
  assignDialogVisible.value = true
  // 如果是从列表行点击，默认填充被协助人
  if (assistedUserId) {
    assignForm.assistedUserId = assistedUserId
  }
  // 重置表单
  // assignFormRef.value?.resetFields()
}
// 查询用户列表（含关联助理）
const getUserList = async () => {
  // 1. 查询所有用户
  // const userRes = await listUsers();
  // userList.value = userRes.data;
  // 2. 为每个用户查询关联助理
  // userList.value.forEach(async (user) => {
  //   const assistantRes = await listAssistants(user.id);
  //   user.assistants = assistantRes.data;
  // });
}
// 提交分配
const submitAssign = async () => {
  try {
    // await assignFormRef.value.validate()
    // 调用后端接口
    const res = await assignAssistant({
      assistantUserId: assignForm.assistantUserId,
      assistedUserIds: [assignForm.assistedUserId], // 单次分配一个被协助人，如需批量可改多选
      expireTime: assignForm.expireTime,
    })
    if (res.code === 200) {
      Message.success('分配助理成功！')
      assignDialogVisible.value = false
      // 刷新用户列表（重新查询关联助理）
      getUserList()
    }
  } catch (error) {
    Message.error(`分配失败：${error}`)
  }
}

// 解除助理关联
const handleUnAssign = async (assistantUserId, assistedUserId) => {
  // try {
  //   await MessageBox.confirm('确定要解除该助理关联吗？', '提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning',
  //   })

  // } catch (error) {
  //   Message.error(`解除失败：${error.message}`)
  // }
  const res = await unAssign({
    assistantUserId,
    assistedUserId,
  })
  if (res.code === 200) {
    Message.success('解除关联成功！')
    getUserList() // 刷新列表
  }
}

onMounted(() => {
  const deptIdFromRoute = route.query.deptId as string
  if (deptIdFromRoute) {
    // 延迟执行，确保部门树已加载完成
    nextTick(() => {
      // 设置查询表单中的部门ID
      queryForm.deptId = deptIdFromRoute

      // 尝试选中部门树节点
      selectDeptTreeNode(deptIdFromRoute)

      // 执行搜索
      search()
    })
  }
})
// 监听路由参数变化
watch(
  () => route.query.deptId,
  (newDeptId) => {
    if (newDeptId) {
      queryForm.deptId = newDeptId as string
      selectDeptTreeNode(newDeptId as string)
      search()
    }
  },
)

// 根据选中部门查询
const handleSelectDept = (keys: Array<any>) => {
  const deptId = keys.length === 1 ? keys[0] : undefined
  queryForm.deptId = deptId
  search()
}
</script>

<style scoped lang="scss">
.page_header {
  flex: 0 0 auto;
}

.page_content {
  flex: 1;
  overflow: auto;
}
</style>
