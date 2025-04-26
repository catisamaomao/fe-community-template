<template>
  <div class="dashboard">
    <div class="welcome-card" v-show="showWelcome" @animationend="animationEnd">
      <h1 class="welcome-title">欢迎来到喵喵社团官网系统喵 ~</h1>
      <p class="welcome-subtitle">数据无价，谨慎操作喵～</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeDashboard',
  data() {
    return {
      showWelcome: false
    }
  },
  mounted() {
    // 页面挂载后播放欢迎动画
    this.showWelcome = true
  },
  methods: {
    animationEnd() {
      // 动画结束后可扩展操作
    }
  }
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/welcomeBackgroup.jpg') no-repeat center center;
  background-size: cover;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.85);
  padding: 60px 80px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeZoomIn 1s ease forwards;
  transform: scale(0.8);
  opacity: 0;
}

@keyframes fadeZoomIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.welcome-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #409EFF;
}

.welcome-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}

.el-button {
  font-size: 16px;
  padding: 12px 30px;
}
</style>
