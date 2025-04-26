<template>
    <div class="page-tabs-wrapper">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange" type="card">
        <el-tab-pane label="用户角色配置" name="userRole">
          <!-- 仅当前 tab 加载 -->
          <AppUserRoleConfig v-if="activeTab === 'userRole'" />
        </el-tab-pane>
        <el-tab-pane label="角色管理" name="roleAdmin">
          <AppRoleAdmin v-if="activeTab === 'roleAdmin'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script>
  import AppUserRoleConfig from './AppUserRoleConfig.vue'
  import AppRoleAdmin from './AppRoleAdmin.vue'
  
  export default {
    name: 'AppRoleTabPage',
    components: {
      AppUserRoleConfig,
      AppRoleAdmin
    },
    data() {
      return {
        activeTab: 'userRole'
      }
    },
    methods: {
      handleTabChange(tab) {
        console.log('当前 tab name:', tab.name)
      }
    }
  }
  </script>
  
  <style scoped>
  .page-tabs-wrapper {
    background-color: #fff;
    padding: 20px;
  }
  </style>
  