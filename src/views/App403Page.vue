<template>
    <div class="app-403-page">
      <el-result
        icon="warning"
        title="403 无权限访问"
        sub-title="喵呜～你没有访问该页面的权限~"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App403Page'
  }
  </script>
  
  <style scoped>
  .app-403-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
  }
  </style>
  