<template>
  <div class="app-403-page">
    <div class="content-box">
      <h1 class="error-title">无权限访问喵</h1>
      <p class="error-subtitle">喵呜～你没有访问该页面的权限哦～</p>
      <el-button type="primary" @click="$router.push('/home')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App403Page'
}
</script>

<style scoped>
.app-403-page {
  height: 100vh;
  width: 100%;
  background: url('@/assets/403.png') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.app-403-page::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.content-box {
  text-align: center;
  z-index: 2;
}

.error-title {
  font-size: 40px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.error-subtitle {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}

.el-button {
  font-size: 16px;
  padding: 10px 30px;
}
</style>
