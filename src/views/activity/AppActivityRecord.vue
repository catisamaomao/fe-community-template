<template>
    <div class="app-activity-record">
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-select v-model="search.status" placeholder="状态" style="width: 120px" clearable>
            <el-option label="未开始" :value="1" />
            <el-option label="进行中" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
          <el-input v-model="search.sponsorName" placeholder="发起人姓名" clearable style="width: 200px" />
          <el-date-picker
            v-model="search.timeRange"
            type="daterange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd"
            clearable
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <el-table :data="list" border style="width: 100%;" v-loading="loading">
        <el-table-column prop="sponsorName" label="发起人" align="center" />
        <el-table-column prop="startTime" label="开始时间" align="center" />
        <el-table-column prop="endTime" label="结束时间" align="center" />
        <el-table-column prop="site" label="举办地点" align="center" />
        <el-table-column prop="status" label="状态" :formatter="formatStatus" align="center" />
        <el-table-column label="参与人" align="center">
          <template #default="scope">
            <div>
              <div v-for="(user, index) in scope.row.joinUserName" :key="index">{{ user }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button size="mini" type="danger" @click="quitActivity(scope.row.id)">撤回</el-button>
          </template>
        </el-table-column>
      </el-table>
  
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
    name: 'AppActivityRecord',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        search: {
          status: null,
          sponsorName: '',
          timeRange: []
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10,
          orderByItems: [{ column: 'startTime', asc: false }]
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      formatStatus(row) {
        switch (row.status) {
          case 1: return '未开始'
          case 2: return '进行中'
          case 3: return '已完成'
          case 4: return '已取消'
          default: return '-'
        }
      },
      fetchData() {
        this.loading = true
        const payload = {
          pageRequest: { ...this.pageRequest },
          status: this.search.status,
          sponsorName: this.search.sponsorName,
          startTime: this.search.timeRange?.[0] ? this.search.timeRange[0] + 'T00:00:00' : null,
          endTime: this.search.timeRange?.[1] ? this.search.timeRange[1] + 'T23:59:59' : null
        }
        service.post('/activity/pageActivityRecord', payload)
          .then(res => {
            this.list = res.results || []
            this.total = res.total || 0
          })
          .finally(() => {
            this.loading = false
          })
      },
      handleSearch() {
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      resetSearch() {
        this.search = { status: null, sponsorName: '', timeRange: [] }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      quitActivity(id) {
        this.$confirm('确定要撤回该活动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          service.post('/activity/quitActivity', { activityId: id })
            .then(() => {
              this.$message.success('撤回成功')
              this.fetchData()
            })
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-activity-record {
    padding: 20px;
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
  