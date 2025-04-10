<template>
  <div class="register-container">
    <el-form :model="registerForm" :rules="registerRules" ref="registerForm" class="register-form">
      <h3 class="title">注册</h3>
      
      <!-- 新增用户类型选择 -->
      <el-form-item prop="type" class="user-type-item">
        <el-radio-group v-model="registerForm.type">
          <el-radio :label="1" border>普通用户</el-radio>
          <el-radio :label="2" border>管理员</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="name">
        <el-input v-model="registerForm.name" placeholder="用户名" />
      </el-form-item>

      <el-form-item prop="email">
        <el-input v-model="registerForm.email" placeholder="邮箱">
          <template slot="prefix"><i class="el-icon-message" /></template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input type="password" v-model="registerForm.password" placeholder="密码" />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input type="password" v-model="registerForm.confirmPassword" placeholder="确认密码" />
      </el-form-item>

      <el-form-item prop="code">
        <el-input v-model="registerForm.code" placeholder="验证码">
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
        <el-button type="primary" @click="handleRegister">注册</el-button>
        <el-button @click="goToLogin">返回登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'AppRegister',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      registerForm: {
        type: 1, // 默认选择普通用户
        name: '',
        email: '',
        password: '',
        code: ''
      },
      registerRules: {
        type: [
          { 
            required: true,
            message: '请选择用户类型',
            trigger: 'change'
          }
        ],
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 16, message: '长度在2到16个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码为6位数字', trigger: 'blur' }
        ]
      },
      countdown: 0,
      sending: false
    }
  },
  methods: {
    sendCode() {
      if (this.countdown > 0 || this.sending) return
      
      this.$refs.registerForm.validateField('email', errorMessage => {
        if (errorMessage) {
          this.$message.error('请先填写正确的邮箱')
          return
        }
        
        this.sending = true
        axios.post('/auth/sendCode', { 
          email: this.registerForm.email,
          type: 'register'
        })
          .then(() => {
            this.$message.success('验证码已发送')
            this.startCountdown()
          })
          .catch(err => {
            this.$message.error(err?.message || '发送失败')
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

    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return

        axios.post('/auth/register', {
          type: this.registerForm.type,
          name: this.registerForm.name,
          email: this.registerForm.email,
          code: this.registerForm.code,
          password: this.registerForm.password
        })
          .then(() => {
            this.$message.success('注册成功')
            this.$router.push('/login')
          })
          .catch(err => {
            this.$message.error(err?.message || '注册失败')
          })
      })
    },

    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.register-container {
  width: 400px;
  margin: 100px auto;
}
.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}
.user-type-item .el-radio-group {
  width: 100%;
}
.user-type-item .el-radio {
  width: 48%;
  margin: 0 1% !important;
}
</style>