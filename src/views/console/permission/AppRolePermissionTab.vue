<template>
  <div class="app-role-permission-tab">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-select
          v-model="currentRoleId"
          placeholder="选择角色"
          clearable
          style="width: 250px"
          @change="loadRolePermissions"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
        <el-button
          v-if="currentRoleId"
          type="primary"
          :loading="saving"
          icon="el-icon-check"
          @click="submitRolePermissions"
        >
          保存配置
        </el-button>
        <el-button
          type="text"
          @click="toggleExpandAll"
        >
          {{ expandAll ? '收起全部' : '展开全部' }}
        </el-button>
      </div>
    </el-card>

    <!-- 权限树 -->
    <el-card class="tree-card">
      <el-tree
        ref="permissionTree"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        highlight-current
        :expand-on-click-node="false"
        :default-expanded-keys="expandKeys"
        :default-checked-keys="checkedPermissionIds"
        :props="treeProps"
        class="permission-tree"
      />
    </el-card>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'AppRolePermissionTab',
  data() {
    return {
      roleList: [],
      currentRoleId: null,
      permissionList: [],   // 所有权限原始列表
      permissionTree: [],   // 组织好的树
      checkedPermissionIds: [],
      expandAll: true,
      saving: false,
      treeProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    this.initData()
  },
  computed: {
    expandKeys() {
      // 控制父节点展开/收起（只展开分组）
      return this.expandAll ? this.permissionTree.map(item => item.id) : []
    }
  },
  methods: {
    async initData() {
      await Promise.all([
        this.fetchRoles(),
        this.fetchPermissions()
      ])
    },
    async fetchRoles() {
      const res = await axios.post('/role/listRole')
      this.roleList = res || []
    },
    async fetchPermissions() {
      const res = await axios.post('/permission/getPermissionByRole', {})
      this.permissionList = res || []
      this.buildPermissionTree()
    },
    buildPermissionTree() {
      const typeGroupMap = {
        1: '菜单权限',
        2: '按钮权限',
        3: '接口权限'
      }
      const grouped = {}
      this.permissionList.forEach(p => {
        const groupName = typeGroupMap[p.type] || '其他'
        if (!grouped[groupName]) grouped[groupName] = []
        grouped[groupName].push({ id: p.id, name: p.name })
      })
      this.permissionTree = Object.entries(grouped).map(([groupName, children]) => ({
        id: groupName,
        name: groupName,
        children
      }))
    },
    async loadRolePermissions() {
      if (!this.currentRoleId) {
        this.checkedPermissionIds = []
        this.$nextTick(() => {
          this.$refs.permissionTree.setCheckedKeys([])
        })
        return
      }
      const res = await axios.post('/permission/getPermissionByRole', { roleId: this.currentRoleId })
      this.checkedPermissionIds = (res || []).map(p => p.id)
      this.$nextTick(() => {
        this.$refs.permissionTree.setCheckedKeys(this.checkedPermissionIds)
      })
    },
    async submitRolePermissions() {
  if (!this.currentRoleId) {
    this.$message.warning('请选择角色')
    return
  }
  let checkedKeys = this.$refs.permissionTree.getCheckedKeys()

  // 过滤掉分组（父节点）ID，只保留真实的权限id
  checkedKeys = checkedKeys.filter(id => typeof id === 'number')

  try {
    this.saving = true
    await axios.post('/role/updateRole', {
      id: this.currentRoleId,
      permissionIds: checkedKeys
    })
    this.$message.success('权限配置成功')
    this.loadRolePermissions()
  } catch (e) {
    this.$message.error('保存失败，请稍后再试')
  } finally {
    this.saving = false
  }
},

    toggleExpandAll() {
      this.expandAll = !this.expandAll
    }
  }
}
</script>

<style scoped>
.app-role-permission-tab {
  padding: 20px;
}
.toolbar-card {
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
}
.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}
.tree-card {
  padding: 15px;
  background: #fff;
  margin-top: 10px;
}
.permission-tree {
  margin-top: 10px;
  font-size: 14px;
}
.permission-tree ::v-deep .el-tree-node__content {
  height: 36px;
  line-height: 36px;
}
.permission-tree ::v-deep .el-tree-node__label {
  font-weight: 500;
}
</style>
