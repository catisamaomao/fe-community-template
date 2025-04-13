<template>
  <div class="app-activity-record">
    <!-- 搜索栏 -->
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

    <!-- 活动记录表格 -->
    <el-table :data="list" border style="width: 100%;" v-loading="loading">
      <el-table-column prop="sponsorName" label="发起人" align="center" />
      <el-table-column prop="startTime" label="开始时间" align="center" />
      <el-table-column prop="endTime" label="结束时间" align="center" />
      <el-table-column prop="site" label="举办地点" align="center" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          {{ formatStatus(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="参与人" align="center">
        <template #default="scope">
          <div>
            <div v-for="(user, index) in scope.row.joinUserName" :key="index">{{ user }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <!-- 管理员：显示编辑按钮 -->
          <el-button size="mini" type="primary" v-if="isAdmin" @click="openEdit(scope.row)">编辑</el-button>
          <!-- 普通用户：显示撤回按钮 -->
          <el-button size="mini" type="danger" v-else @click="quitActivity(scope.row.id)">撤回</el-button>
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

    <!-- 编辑弹窗 -->
    <el-dialog :title="'编辑活动记录'" :visible.sync="editDialogVisible" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="举办地点">
          <el-input v-model="editForm.site" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            placeholder="选择开始时间"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editForm.endTime"
            type="datetime"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            placeholder="选择结束时间"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </div>
    </el-dialog>
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
      },
      editDialogVisible: false,
      editForm: {
        id: null,
        site: '',
        startTime: null,
        endTime: null
      },
      isAdmin: false // 🔥 是否管理员喵
    }
  },
  created() {
    this.isAdmin = localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2'
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
    },
    openEdit(row) {
      this.editForm = {
        id: row.id,
        site: row.site,
        startTime: row.startTime,
        endTime: row.endTime
      }
      this.editDialogVisible = true
    },
    submitEdit() {
      const payload = {
        id: this.editForm.id,
        site: this.editForm.site,
        startTime: this.editForm.startTime,
        endTime: this.editForm.endTime
      }
      service.post('/activity/updateActivityRecord', payload)
        .then(() => {
          this.$message.success('保存成功喵～')
          this.editDialogVisible = false
          this.fetchData()
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
.dialog-footer {
  text-align: right;
}
</style>
