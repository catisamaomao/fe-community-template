<template>
    <div class="app-entry-admin">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="入社申请" name="apply">
          <!-- 入社申请模块 -->
          <app-entry-apply-tab />
        </el-tab-pane>
        <el-tab-pane label="入社记录" name="record">
          <!-- 入社记录模块 -->
          <app-entry-record-tab />
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script>
  import AppEntryApplyTab from './AppEntryApplyTab.vue'
  import AppEntryRecordTab from './AppEntryRecordTab.vue'
  
  export default {
    name: 'AppEntryAdmin',
    components: {
      AppEntryApplyTab,
      AppEntryRecordTab
    },
    data() {
      return {
        activeTab: 'apply'
      }
    }
  }
  </script>
  
  <style scoped>
  .app-entry-admin {
    padding: 20px;
  }
  </style>
  