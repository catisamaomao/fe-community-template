import Vue from 'vue'
import Vuex from 'vuex'
import service from '@/utils/axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {},
    dictionaryOptions: [],
    roleList: [],
    permissionList: [],  // 系统所有权限
    userPermissions: [], // 当前登录用户拥有的权限Code
    loading: false       // 初始化 loading 状态
  },
  mutations: {
    setUserInfo(state, user) {
      state.userInfo = user
    },
    setDictionaryOptions(state, list) {
      state.dictionaryOptions = list || []
    },
    setRoleList(state, list) {
      state.roleList = list || []
    },
    setPermissionList(state, list) {
      state.permissionList = list || []
    },
    setUserPermissions(state, list) {
      state.userPermissions = list || []
    },
    setLoading(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async fetchAllInitData({ commit, dispatch }) {
      commit('setLoading', true)
      try {
        await Promise.all([
          dispatch('fetchUserInfo'),
          dispatch('fetchDictionaryOptions'),
          dispatch('fetchRoleList'),
          dispatch('fetchUserPermissions')
        ])
        console.log('初始化所有数据完成喵～')
      } catch (e) {
        console.error('初始化数据出错喵～', e)
      } finally {
        commit('setLoading', false)
      }
    },

    async fetchUserInfo({ commit }) {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      const res = await service.post('/user/getUserInfo', { userId: parseInt(userId) })
      localStorage.setItem('name', res.name || '')
      localStorage.setItem('email', res.email || '')
      localStorage.setItem('school', res.school || '')
      localStorage.setItem('motto', res.motto || '')
      localStorage.setItem('type', res.type || '')
      localStorage.setItem('love', res.love || '')
      localStorage.setItem('studentNum', res.studentNum || '')
      localStorage.setItem('avatarUrl', res.avatarUrl || '')
      localStorage.setItem('departmentId', res.departmentId || '')
      localStorage.setItem('departmentName', res.departmentName || '')
      commit('setUserInfo', res)
    },

    async fetchDictionaryOptions({ commit }) {
      const res = await service.post('/dictionary/init')
      commit('setDictionaryOptions', res || [])
    },

    async fetchRoleList({ commit }) {
      const res = await service.post('/role/listRole')
      commit('setRoleList', res || [])
    },

    async fetchUserPermissions({ commit }) {
      const userId = parseInt(localStorage.getItem('userId'))
      if (!userId) return
      const roles = await service.post('/role/getRoleByUserId', { userId })
      const roleIds = (roles || []).map(r => r.id)

      if (!roleIds.length) {
        localStorage.setItem('userPermissions', JSON.stringify([]))
        commit('setUserPermissions', [])
        return
      }

      const permissionPromises = roleIds.map(roleId =>
        service.post('/permission/getPermissionByRole', { roleId })
      )
      const permissionResults = await Promise.all(permissionPromises)
      const allPermissions = permissionResults.flat()

      const permissionCodes = Array.from(new Set(allPermissions.map(p => p.code)))
      localStorage.setItem('userPermissions', JSON.stringify(permissionCodes))
      commit('setUserPermissions', permissionCodes)
    }
  },
  getters: {
    getDictionaryOptions: state => state.dictionaryOptions,
    getRoleList: state => state.roleList,
    getUserDepartmentName: state => state.userInfo.departmentName || '-',
    getUserPermissions: state => state.userPermissions,
    getLoading: state => state.loading,
    hasPermission: (state) => (code) => {
      return state.userPermissions.includes(code)
    }
  },
  modules: {}
})