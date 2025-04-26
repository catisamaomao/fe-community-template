<template>
    <div class="app-500-page">
      <div class="content-box">
        <h1 class="error-title">喵呜～服务器开小差啦！</h1>
        <p class="error-subtitle">
          服务器在打瞌睡喵～请联系开发者帮忙修一下喵ฅ(´・ω・｀)ฅ
        </p>
        <el-button type="primary" @click="$router.push('/home')">
          返回首页喵～
        </el-button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App500Page'
  }
  </script>
  
  <style scoped>
  .app-500-page {
    height: 100vh;
    width: 100%;
    background: url('@/assets/403.png') no-repeat center center;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  
  /* 遮罩层，让文字更清楚 */
  .app-500-page::after {
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
    line-height: 1.6;
  }
  
  .el-button {
    font-size: 16px;
    padding: 10px 30px;
  }
  </style>
  