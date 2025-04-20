<template>
    <div class="app-leave-apply-tab">
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.userId" placeholder="用户ID" clearable style="width: 180px" />
          <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px">
            <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
          </el-select>
          <el-date-picker
            v-model="search.dateRange"
            type="daterange"
            start-placeholder="时间起"
            end-placeholder="时间止"
            style="width: 300px"
            clearable
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-card>
  
      <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="userId" label="用户ID" align="center" width="100" />
        <el-table-column label="用户名" align="center" width="150">
          <template #default="scope">
            {{ userMap[scope.row.userId] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="离社原因" align="center" />
        <el-table-column prop="planLeaveTime" label="计划离社时间" align="center" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            {{ statusMap[scope.row.status] || '-' }}
          </template>
        </el-table-column>
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
      <el-dialog title="编辑离社申请" :visible.sync="editDialogVisible" width="500px">
        <el-form :model="editForm" label-width="100px" ref="editFormRef">
          <el-form-item label="离社原因">
            <el-input v-model="editForm.reason" />
          </el-form-item>
          <el-form-item label="计划离社时间">
            <el-date-picker v-model="editForm.planLeaveTime" type="datetime" style="width: 100%" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="editForm.status">
              <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
            </el-select>
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
    name: 'AppLeaveApplyTab',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        editDialogVisible: false,
        editForm: {},
        userMap: {},
        search: {
          userId: '',
          status: null,
          dateRange: []
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        },
        statusMap: {
          0: '待审批',
          1: '已通过',
          2: '已撤销',
          3: '已驳回'
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      async fetchData() {
        this.loading = true
        const [planStartLeaveTime, planEndLeaveTime] = this.search.dateRange || []
        try {
          const res = await axios.post('/leave/pageLeaveApply', {
            pageRequest: this.pageRequest,
            userId: this.search.userId,
            status: this.search.status,
            planStartLeaveTime,
            planEndLeaveTime
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
        const res = await axios.post('/user/pageUserInfo', {
          pageRequest: { pageNo: 1, pageSize: 1000 },
          idList: userIds
        })
        const map = {}
        for (const u of res.results || []) {
          map[u.id] = u.name
        }
        this.userMap = map
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
      openEditDialog(row) {
        this.editForm = { ...row }
        this.editDialogVisible = true
      },
      submitEdit() {
        axios.post('/leave/updateLeaveApply', this.editForm).then(() => {
          this.$message.success('修改成功')
          this.editDialogVisible = false
          this.fetchData()
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-leave-apply-tab {
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
  