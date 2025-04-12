<template>
    <div class="app-announcement-user">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-date-picker
            v-model="search.releaseTime"
            type="date"
            placeholder="选择发布时间"
            value-format="yyyy-MM-dd"
            clearable
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <!-- 公告列表 -->
      <el-table :data="list" border style="width: 100%;" v-loading="loading">
        <el-table-column prop="content" label="公告内容" align="left" min-width="300" show-overflow-tooltip />
        <el-table-column prop="releaseTime" label="发布时间" align="center" width="200" />
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
  import service from '@/utils/axios'
  
  export default {
    name: 'AppAnnouncementUser',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        pageRequest: {
          pageNo: 1,
          pageSize: 10,
          orderByItems: [{ column: 'releaseTime', asc: false }]
        },
        search: {
          releaseTime: null  // ✨ 新增的搜索字段
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.loading = true
        const payload = {
          pageRequest: {  
            pageNo: this.pageRequest.pageNo,
            pageSize: this.pageRequest.pageSize,
            orderByItems: this.pageRequest.orderByItems
          },
          status: 3,
          ...(this.search.releaseTime ? { releaseTime: this.search.releaseTime + 'T00:00:00' } : {})
        }
        service.post('/announcement/pageAnnouncement', payload)
          .then(res => {
            this.list = Array.isArray(res.results) ? res.results : []
            this.total = typeof res.total === 'number' ? res.total : 0
          })
          .catch(() => {
            this.list = []
            this.total = 0
          })
          .finally(() => {
            this.loading = false
          })
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      handleSearch() {
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      resetSearch() {
        this.search.releaseTime = null
        this.pageRequest.pageNo = 1
        this.fetchData()
      }
    }
  }
  </script>
  
  <style scoped>
  .app-announcement-user {
    padding: 20px;
  }
  .toolbar-card {
    margin-bottom: 15px;
  }
  .search-bar {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  </style>
  