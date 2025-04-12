import Vue from 'vue'
import Vuex from 'vuex'
import service from '@/utils/axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {}
  },
  mutations: {
    setUserInfo(state, user) {
      state.userInfo = user
    }
  },
  actions: {
    async fetchUserInfo({ commit }) {
      const userId = localStorage.getItem('userId') // 或者从其他地方获取 userId
      try {
        
        const res = await service.post('/user/getUserInfo', {
          userId: parseInt(userId)  // 👈 确保是数字
        })
    
        console.log("获取用户信息成功")
        // 存入用户基本信息在本地
        
        localStorage.setItem('name', res.name || '')
        localStorage.setItem('email', res.email || '')
        localStorage.setItem('school', res.school || '')
        localStorage.setItem('motto', res.motto || '')
        localStorage.setItem('type',res.type || '')
        localStorage.setItem('love', res.love || '')
        localStorage.setItem('studentNum', res.studentNum || '')
        localStorage.setItem('avatarUrl', res.avatarUrl || '')
        commit('setUserInfo', res)
      } catch (e) {
        throw new Error('获取用户信息失败2')
      }
    }
    
  }
})
