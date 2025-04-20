<template>
    <div class="app-user-info-tab">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.name" placeholder="姓名" clearable style="width: 180px" />
          <el-input v-model="search.id" placeholder="用户ID" clearable style="width: 150px" />
          <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
          <el-select v-model="search.type" placeholder="类型" clearable style="width: 150px">
            <el-option :value="0" label="开发者" />
            <el-option :value="1" label="普通成员" />
            <el-option :value="2" label="干部" />
            <el-option :value="3" label="管理员" />
          </el-select>
          <el-input v-model="search.school" placeholder="学校" clearable style="width: 200px" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <!-- 表格展示 -->
      <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="用户ID" align="center" width="100" />
        <el-table-column label="头像" align="center" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatarUrl" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="studentNum" label="学号" align="center" />
        <el-table-column prop="school" label="学校" align="center" />
        <el-table-column prop="love" label="兴趣爱好" align="center" />
        <el-table-column prop="motto" label="个性签名" align="center" />
        <el-table-column prop="type" label="类型" align="center">
          <template #default="scope">
            {{ typeMap[scope.row.type] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页器 -->
      <el-pagination
        background
        layout="prev, pager, next, total"
        :current-page="pageRequest.pageNo"
        :page-size="pageRequest.pageSize"
        :total="total"
        @current-change="handlePageChange"
        class="pagination"
      />
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios'
  
  export default {
    name: 'AppUserInfoTab',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        search: {
          name: '',
          id: '',
          status: null,
          type: null,
          school: ''
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        },
        typeMap: {
          0: '开发者',
          1: '普通成员',
          2: '干部',
          3: '管理员'
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.loading = true
        axios.post('/user/pageUserInfo', {
          pageRequest: this.pageRequest,
          ...this.search
        }).then(res => {
          this.list = res.results || []
          this.total = res.total || 0
        }).finally(() => {
          this.loading = false
        })
      },
      handleSearch() {
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      resetSearch() {
        this.search = {
          name: '',
          id: '',
          status: null,
          type: null,
          school: ''
        }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      }
    }
  }
  </script>
  
  <style scoped>
  .app-user-info-tab {
    padding-top: 10px;
  }
  .toolbar-card {
    margin-bottom: 15px;
  }
  .search-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  </style>
  