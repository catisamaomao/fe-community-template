<template>
  <div class="login-container">
    <el-form :model="form" :rules="rules" ref="loginForm" class="login-form">
      <h3 class="title">账号登录</h3>

      <el-form-item prop="name">
        <el-input v-model="form.name" placeholder="请输入账号">
          <template slot="prefix"><i class="el-icon-user" /></template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入密码"
          show-password
        >
          <template slot="prefix"><i class="el-icon-lock" /></template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin">
          登录
        </el-button>
        <el-button @click="$router.push('/email-login')">验证码登录</el-button>
        <el-button type="text" @click="$router.push('/register')">去注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'AppLogin',
  data() {
    return {
      form: {
        name: '',
        password: ''
      },
      rules: {
        name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return
        this.loading = true
        axios.post('/auth/login', this.form)
          .then(async res => {
            this.$message.success('登录成功')
            localStorage.setItem('token', res.token)
            localStorage.setItem('userId', res.user.id)
            // 登录成功后，拉取用户初始化信息
            await this.$store.dispatch('fetchAllInitData')
            this.$router.push('/home')
          })
          .catch(err => {
            this.$message.error(err || '登录失败')
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 100px auto;
}
.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
