<template>
    <div class="app-permission-manage">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="权限管理" name="permission">
          <PermissionTab v-if="activeTab === 'permission'" />
        </el-tab-pane>
        <el-tab-pane label="角色权限配置" name="rolePermission">
          <RolePermissionTab v-if="activeTab === 'rolePermission'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script>
  import PermissionTab from './AppPermissionTab.vue'
  import RolePermissionTab from './AppRolePermissionTab.vue'
  
  export default {
    name: 'AppPermissionManage',
    components: {
      PermissionTab,
      RolePermissionTab
    },
    data() {
      return {
        activeTab: 'permission'
      }
    }
  }
  </script>
  
  <style scoped>
  .app-permission-manage {
    padding: 20px;
    background: #fff;
  }
  </style>
  