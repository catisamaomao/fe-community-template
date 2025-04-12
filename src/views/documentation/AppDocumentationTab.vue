<template>
    <div class="app-documentation-tab">
      <el-card>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="资料管理" name="documentation">
            <AppDocumentationAdmin v-if="activeTab === 'documentation'" />
          </el-tab-pane>
          <el-tab-pane label="分类管理" name="type">
            <AppDocumentationTypeAdmin v-if="activeTab === 'type'" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </template>
  
  <script>
  // 记得引入两个子组件
  import AppDocumentationAdmin from './AppDocumentationAdmin.vue'
  import AppDocumentationTypeAdmin from './AppDocumentationTypeAdmin.vue'
  
  export default {
    name: 'AppDocumentationTab',
    components: {
      AppDocumentationAdmin,
      AppDocumentationTypeAdmin
    },
    data() {
      return {
        activeTab: 'documentation' // 默认显示资料管理
      }
    }
  }
  </script>
  
  <style scoped>
  .app-documentation-tab {
    padding: 20px;
  }
  </style>
  