<template>
  <el-container class="home-container">
    <!-- 左侧导航 -->
    <el-aside width="200px" class="nav-aside">
      <!-- 用户信息面板 -->
      <div class="user-panel">
        <el-avatar
          :size="60"
          :src="userInfo.avatarUrl || defaultAvatar"
          class="user-avatar"
        />
        <div class="user-info">
          <div class="user-name">{{ userInfo.name || '未登录用户' }}</div>
          <div class="user-email">{{ userInfo.email || 'guest@example.com' }}</div>
        </div>
      </div>

      <!-- 菜单栏 -->
      <el-menu
        router
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        class="el-menu-vertical"
      >
        <el-menu-item index="/home/dashboard">
          <i class="el-icon-s-home"></i>
          <span>控制台</span>
        </el-menu-item>

        <el-menu-item index="/forum">
          <i class="el-icon-chat-line-round"></i>
          <span>论坛</span>
        </el-menu-item>

        <el-menu-item index="/home/announcement">
          <i class="el-icon-notebook-2"></i>
          <span>公告管理</span>
        </el-menu-item>

        <el-menu-item index="/home/documentation">
          <i class="el-icon-folder"></i>
          <span>资料管理</span>
        </el-menu-item>

        <el-menu-item index="/home/profile">
          <i class="el-icon-user"></i>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>

      <!-- 退出按钮 -->
      <div class="logout-btn">
        <el-button
          type="text"
          icon="el-icon-switch-button"
          @click="handleLogout"
        >退出登录</el-button>
      </div>
    </el-aside>

    <!-- 右侧主内容 -->
    <el-container>
      <el-main class="main-content">
        <transition name="fade-transform" mode="out-in">
          <router-view v-if="!pageLoading" />
        </transition>
        <div v-if="pageLoading" class="loading-wrapper">
          <el-icon class="is-loading" color="#409EFF" :size="30">
            <loading />
          </el-icon>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import defaultAvatar from '@/assets/default-avatar.png'

export default {
  name: 'AppHome',
  data() {
    return {
      defaultAvatar,
      pageLoading: true
    }
  },
  computed: {
    ...mapState(['userInfo']),
    activeMenu() {
      return this.$route.path
    }
  },
  async created() {
    try {
      await this.$store.dispatch('fetchUserInfo')
    } catch (error) {
      this.$message.error('用户信息加载失败')
    } finally {
      this.pageLoading = false
    }
  },
  methods: {
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        this.$router.push('/login')
        this.$message.success('已退出登录')
      })
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  overflow: hidden;
}

.nav-aside {
  background-color: #304156;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.user-panel {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  margin-bottom: 10px;
  border: 2px solid #fff;
}

.user-info {
  color: #fff;
}

.user-name {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-menu {
  border-right: none;
  flex: 1;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
}

.el-menu-item i {
  vertical-align: middle;
  margin-right: 8px;
}

.logout-btn {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn .el-button {
  color: #bfcbd9;
  width: 100%;
}

.logout-btn .el-button:hover {
  color: #409EFF;
}

.main-content {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
