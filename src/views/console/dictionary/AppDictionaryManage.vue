<template>
    <div class="app-dictionary-manage">
      <el-card>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="字典类型管理" name="type">
            <AppDictionaryTypeAdmin v-if="activeTab === 'type'" />
          </el-tab-pane>
          <el-tab-pane label="字典项管理" name="item">
            <AppDictionaryAdmin v-if="activeTab === 'item'" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </template>
  
  <script>
  import AppDictionaryTypeAdmin from './AppDictionaryTypeAdmin.vue'
  import AppDictionaryAdmin from './AppDictionaryAdmin.vue'
  
  export default {
    name: 'AppDictionaryManage',
    components: {
      AppDictionaryTypeAdmin,
      AppDictionaryAdmin
    },
    data() {
      return {
        activeTab: 'type' // 默认选中 字典类型管理
      }
    }
  }
  </script>
  
  <style scoped>
  .app-dictionary-manage {
    padding: 20px;
  }
  </style>
  