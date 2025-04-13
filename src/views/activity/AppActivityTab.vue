<template>
  <div class="app-activity-tab">
    <el-tabs v-model="activeName">
      <el-tab-pane label="活动申请" name="apply">
        <AppActivityApply v-if="activeName === 'apply'" :isAdmin="isAdmin" />
      </el-tab-pane>
      <el-tab-pane label="活动记录" name="record" v-if="isAdmin">
        <AppActivityRecord v-if="activeName === 'record'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AppActivityApply from './AppActivityApply.vue'
import AppActivityRecord from './AppActivityRecord.vue'

export default {
  name: 'AppActivityTab',
  components: {
    AppActivityApply,
    AppActivityRecord
  },
  data() {
    return {
      activeName: 'apply',
      isAdmin: false
    }
  },
  created() {
    const type = Number(localStorage.getItem('type') || 1)
    this.isAdmin = type === 0 || type === 2 // 0/2是管理员喵～
  }
}
</script>

<style scoped>
.app-activity-tab {
  padding: 20px;
}
</style>
