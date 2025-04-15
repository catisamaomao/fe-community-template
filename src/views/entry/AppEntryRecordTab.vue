<template>
    <div class="app-entry-record-tab">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input 
            v-model="search.userId" 
            placeholder="用户ID" 
            clearable 
            style="width: 180px" 
          />
          <el-select 
            v-model="search.status" 
            placeholder="状态" 
            clearable 
            style="width: 150px"
          >
            <el-option label="待处理" :value="1" />
            <el-option label="通过" :value="2" />
            <el-option label="拒绝" :value="3" />
          </el-select>
          <el-date-picker
            v-model="search.dateRange"
            type="daterange"
            start-placeholder="时间起"
            end-placeholder="时间止"
            value-format="yyyy-MM-dd"
            clearable
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <!-- 表格 -->
      <el-table :data="list" border stripe style="width: 100%;" v-loading="loading">
        <el-table-column prop="userId" label="用户ID" align="center" />
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column prop="phone" label="手机号" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="school" label="学校" align="center" />
        <el-table-column prop="studentNum" label="学号" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-select
              v-model="scope.row.status"
              size="mini"
              placeholder="状态"
              @change="updateStatus(scope.row)"
            >
              <el-option label="待处理" :value="1" />
              <el-option label="通过" :value="2" />
              <el-option label="拒绝" :value="3" />
            </el-select>
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
  import service from '@/utils/axios'
  
  export default {
    name: 'AppEntryRecordTab',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        search: {
          userId: '',
          status: null,
          dateRange: []
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.loading = true
        const [startTime, endTime] = this.search.dateRange || []
        service.post('/entry/pageEntryRecord', {
          pageRequest: { ...this.pageRequest },
          userId: this.search.userId,
          status: this.search.status,
          startTime,
          endTime
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
        this.search = { userId: '', status: null, dateRange: [] }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      updateStatus(row) {
        const payload = {
          id: row.id,
          status: row.status,
          phone: row.phone,
          email: row.email,
          school: row.school,
          studentNum: row.studentNum
        }
        service.post('/entry/updateEntryRecord', payload).then(() => {
          this.$message.success('状态更新成功')
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-entry-record-tab {
    padding-top: 10px;
  }
  .toolbar-card {
    margin-bottom: 15px;
  }
  .search-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  </style>
  