import Vue from 'vue'
import Vuex from 'vuex'
import service from '@/utils/axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {},
    dictionaryOptions: [] // ✨ 字典缓存喵～
  },
  mutations: {
    setUserInfo(state, user) {
      state.userInfo = user
    },
    setDictionaryOptions(state, list) {
      state.dictionaryOptions = list || []
    }
  },
  actions: {
    async fetchUserInfo({ commit }) {
      const userId = localStorage.getItem('userId')
      try {
        const res = await service.post('/user/getUserInfo', {
          userId: parseInt(userId)
        })
        console.log("获取用户信息成功喵～")
        // 存到 localStorage
        localStorage.setItem('name', res.name || '')
        localStorage.setItem('email', res.email || '')
        localStorage.setItem('school', res.school || '')
        localStorage.setItem('motto', res.motto || '')
        localStorage.setItem('type', res.type || '')
        localStorage.setItem('love', res.love || '')
        localStorage.setItem('studentNum', res.studentNum || '')
        localStorage.setItem('avatarUrl', res.avatarUrl || '')

        commit('setUserInfo', res)
      } catch (e) {
        console.error('获取用户信息失败喵～', e)
        throw new Error('获取用户信息失败')
      }
    },

    async fetchDictionaryOptions({ commit }) {
      try {
        const res = await service.post('/dictionary/init')
        commit('setDictionaryOptions', res || [])
      } catch (e) {
        console.error('初始化字典失败喵～', e)
      }
    }
  },
  getters: {
    getDictionaryOptions: state => state.dictionaryOptions
  },
  modules: {}
})
