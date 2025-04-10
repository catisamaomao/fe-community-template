<template>
    <div class="home-container">
      <el-card class="box-card">
        <h2>欢迎回来</h2>
        <p><strong>邮箱：</strong>{{ userInfo.email }}</p>
        <p><strong>昵称：</strong>{{ userInfo.nickname || '未设置' }}</p>
        <el-button type="danger" @click="logout">退出登录</el-button>
      </el-card>
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios'
  
  export default {
    name: 'AppHome',
    data() {
      return {
        userInfo: {}
      }
    },
    mounted() {
      axios.get('/api/user/info') // 假设是这个接口，换成你的实际接口
        .then(res => {
          this.userInfo = res
        })
    },
    methods: {
      logout() {
        localStorage.removeItem('token')
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  <style scoped>
  .home-container {
    width: 500px;
    margin: 100px auto;
  }
  </style>
  