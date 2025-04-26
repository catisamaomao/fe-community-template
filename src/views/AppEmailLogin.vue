<template>
    <div class="email-login-container">
      <el-form :model="form" :rules="rules" ref="emailForm" class="email-form">
        <h3 class="title">邮箱登录</h3>
  
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱">
            <template slot="prefix"><i class="el-icon-message" /></template>
          </el-input>
        </el-form-item>
  
        <el-form-item prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码">
            <template slot="suffix">
              <el-button
                type="text"
                :disabled="countdown > 0 || sending"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin">登录</el-button>
          <el-button @click="$router.push('/login')">密码登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios'
  
  export default {
    name: 'AppEmailLogin',
    data() {
      return {
        form: {
          email: '',
          code: ''
        },
        rules: {
          email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
          code: [{ required: true, message: '请输入验证码', trigger: 'submit' }]
        },
        countdown: 0,
        sending: false,
        loading: false
      }
    },
    methods: {
      sendCode() {
        if (this.countdown > 0 || this.sending) return
        this.$refs.emailForm.validateField('email', errorMessage => {
            console.log('发送验证码按钮被点击了')
          if (errorMessage) return
          this.sending = true
          axios.post('/auth/sendCode', { email: this.form.email })
            .then(() => {
              console.log('发送ok')
              this.$message.success('验证码已发送')
              this.startCountdown()
            })
            .catch(err => {
              console.log('发送失败')
              this.$message.error(err || '发送失败')
            })
            .finally(() => {
              this.sending = false
            })
        })
      },
      startCountdown() {
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown === 0) clearInterval(timer)
        }, 1000)
      },
      handleLogin() {
        this.$refs.emailForm.validate(valid => {
          if (!valid) return
          this.loading = true
          axios.post('/auth/login', this.form)
            .then(async res => {
              this.$message.success('登录成功')
              localStorage.setItem('token', res.token)
              localStorage.setItem('userId',res.user.id)
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
  .email-login-container {
    width: 400px;
    margin: 100px auto;
  }
  .title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
  }
  </style>
  