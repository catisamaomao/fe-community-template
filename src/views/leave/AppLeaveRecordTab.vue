<template>
    <div class="app-leave-record-tab">
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.userId" placeholder="用户ID" clearable style="width: 180px" />
          <el-date-picker
            v-model="search.dateRange"
            type="daterange"
            start-placeholder="离社起"
            end-placeholder="离社止"
            style="width: 300px"
            clearable
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="userId" label="用户ID" align="center" width="100" />
        <el-table-column label="用户名" align="center" width="120">
          <template #default="scope">
            {{ userMap[scope.row.userId] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="leaveApplyId" label="申请ID" align="center" width="100" />
        <el-table-column prop="leaveTime" label="实际离社时间" align="center" />
        <el-table-column prop="createTime" label="记录创建时间" align="center" />
        <el-table-column label="操作" align="center" width="100">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
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
  
      <!-- 编辑弹窗 -->
      <el-dialog title="编辑离社记录" :visible.sync="editDialogVisible" width="500px">
        <el-form :model="editForm" label-width="120px">
          <el-form-item label="实际离社时间">
            <el-date-picker v-model="editForm.leaveTime" type="datetime" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios'
  
  export default {
    name: 'AppLeaveRecordTab',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        userMap: {},
        editDialogVisible: false,
        editForm: {},
        search: {
          userId: '',
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
      async fetchData() {
        this.loading = true
        const [startLeaveTime, endLeaveTime] = this.search.dateRange || []
        try {
          const res = await axios.post('/leave/pageLeaveRecord', {
            pageRequest: this.pageRequest,
            userId: this.search.userId,
            startLeaveTime,
            endLeaveTime
          })
          this.list = res.results || []
          this.total = res.total || 0
          await this.loadUserMapByRecords(this.list)
        } finally {
          this.loading = false
        }
      },
      async loadUserMapByRecords(records) {
        const userIds = Array.from(new Set(records.map(r => r.userId)))
        if (!userIds.length) return
        const userRes = await axios.post('/user/pageUserInfo', {
          pageRequest: { pageNo: 1, pageSize: 1000 },
          idList: userIds
        })
        const map = {}
        for (const user of userRes.results || []) {
          map[user.id] = user.name
        }
        this.userMap = map
      },
      handleSearch() {
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      resetSearch() {
        this.search = { userId: '', dateRange: [] }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      openEditDialog(row) {
        this.editForm = { ...row }
        this.editDialogVisible = true
      },
      submitEdit() {
        axios.post('/leave/updateLeaveRecord', {
          id: this.editForm.id,
          leaveTime: this.editForm.leaveTime
        }).then(() => {
          this.$message.success('更新成功')
          this.editDialogVisible = false
          this.fetchData()
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-leave-record-tab {
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
  