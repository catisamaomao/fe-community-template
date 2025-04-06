<template>
    <div class="register-container">
      <h2>注册账号</h2>
  
      <ValidationObserver v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <!-- 账号 -->
          <div class="form-group">
            <label>手机号或邮箱：</label>
            <ValidationProvider name="账号" rules="required|emailOrPhone" v-slot="{ errors }">
              <input v-model="form.account" placeholder="请输入手机号或邮箱" />
              <span class="error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
  
          <!-- 密码 -->
          <div class="form-group">
            <label>密码：</label>
            <ValidationProvider name="密码" rules="required|min:6" v-slot="{ errors }">
              <input type="password" v-model="form.password" placeholder="请输入密码" />
              <span class="error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
  
          <!-- 确认密码 -->
          <div class="form-group">
            <label>确认密码：</label>
            <ValidationProvider
              name="确认密码"
              rules="required|confirmed:form.password"
              v-slot="{ errors }"
            >
              <input type="password" v-model="form.confirmPassword" placeholder="请再次输入密码" />
              <span class="error">{{ errors[0] }}</span>
            </ValidationProvider>
          </div>
  
          <button type="submit">注册</button>
          <button type="button" class="go-login" @click="$router.push('/login')">已有账号？去登录</button>
        </form>
      </ValidationObserver>
    </div>
  </template>
  
  <script>
  import { ValidationObserver, ValidationProvider, extend } from 'vee-validate'
  import { required, min, confirmed } from 'vee-validate/dist/rules'
  import request from '@/utils/axios'
  
  // 注册规则
  extend('required', required)
  extend('min', min)
  extend('confirmed', confirmed)
  extend('emailOrPhone', {
    validate: value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      const isPhone = /^1[3-9]\d{9}$/.test(value)
      return isEmail || isPhone
    },
    message: '请输入正确的手机号或邮箱'
  })
  
  export default {
    name: 'AppRegister',
    components: {
      ValidationObserver,
      ValidationProvider
    },
    data() {
      return {
        form: {
          account: '',
          password: '',
          confirmPassword: ''
        }
      }
    },
    methods: {
      async onSubmit() {
        const res = await request.post('/auth/register', {
  account: this.form.account,
  password: this.form.password
})

if (res.code === 200) {
  alert('注册成功，请登录')
  this.$router.push('/login')
} else {
  alert(res.message || '注册失败')
}

      }
    }
  }
  </script>
  
  <style scoped>
  .register-container {
    width: 360px;
    margin: 100px auto;
    border: 1px solid #ccc;
    padding: 30px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  .form-group {
    margin-bottom: 16px;
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
    background-color: #42b983;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    margin-top: 10px;
  }
  button.go-login {
    background-color: transparent;
    color: #42b983;
    text-decoration: underline;
  }
  button:hover {
    background-color: #369e72;
  }
  .error {
    font-size: 12px;
    color: red;
  }
  </style>
  