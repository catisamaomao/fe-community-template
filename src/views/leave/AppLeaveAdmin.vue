<template>
    <div class="app-leave-admin">
      <el-card>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="离社申请" name="apply">
            <AppLeaveApplyTab />
          </el-tab-pane>
          <el-tab-pane label="离社记录" name="record">
            <AppLeaveRecordTab />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </template>
  
  <script>
  import AppLeaveApplyTab from './AppLeaveApplyTab.vue'
  import AppLeaveRecordTab from './AppLeaveRecordTab.vue'
  
  export default {
    name: 'AppLeaveAdmin',
    components: {
      AppLeaveApplyTab,
      AppLeaveRecordTab
    },
    data() {
      return {
        activeTab: 'apply'
      }
    }
  }
  </script>
  
  <style scoped>
  .app-leave-admin {
    padding: 10px;
  }
  </style>