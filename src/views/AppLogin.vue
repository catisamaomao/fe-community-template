<template>
  <transition name="fade">
    <div class="login-container">
      <h2>手机号 / 邮箱登录</h2>

      <ValidationObserver v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(handleLogin)">
          <div class="form-group">
            <label>账号：</label>
            <ValidationProvider name="账号" rules="required|emailOrPhone" v-slot="{ errors }">
              <input type="text" v-model="account" placeholder="请输入手机号或邮箱" />
              <span class="error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>

          <div class="form-group">
            <label>密码：</label>
            <ValidationProvider name="密码" rules="required|min:6" v-slot="{ errors }">
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码" />
                <span class="toggle" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </span>
              </div>
              <span class="error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>

          <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
          <button type="button" class="register" @click="goToRegister">还没有账号？去注册</button>
        </form>
      </ValidationObserver>
    </div>
  </transition>
</template>

<script>
import axios from '@/utils/axios' // 自己封装 axios 请求的工具
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate'
import { required, min } from 'vee-validate/dist/rules'

extend('required', required)
extend('min', min)
extend('emailOrPhone', {
  validate: value => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    const isPhone = /^1[3-9]\d{9}$/.test(value)
    return isEmail || isPhone
  },
  message: '请输入正确的手机号或邮箱'
})

export default {
  name: "LoginPage",
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      account: '',
      password: '',
      showPassword: false,
      loading: false
    }
  },
  methods: {
    async handleLogin() {
  if (this.loading) return

  this.loading = true

  try {
    const response = await axios.post('/login', {
      account: this.account,
      password: this.password
    })

    const { token, user } = response.data

    // ✅ 缓存 token 和用户信息（可选：加密处理）
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    alert('登录成功！')

    // ✅ 跳转到主页（论坛页）
    this.$router.push('/forum')
  } catch (error) {
    alert(error.response?.data?.message || '登录失败，请重试')
  } finally {
    this.loading = false
  }
}

  }
}
</script>

<style scoped>
.login-container {
  width: 360px;
  margin: 100px auto;
  border: 1px solid #ccc;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  transition: all 0.3s ease;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 20px;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #42b983;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
button[disabled] {
  background-color: #bbb;
  cursor: not-allowed;
}
button.register {
  background-color: transparent;
  color: #42b983;
  text-decoration: underline;
}
button.register:hover {
  color: #2d946d;
}
.error {
  font-size: 12px;
  color: red;
}
.password-wrapper {
  position: relative;
}
.password-wrapper input {
  padding-right: 30px;
}
.toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
