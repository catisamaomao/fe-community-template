<template>
  <div class="app-activity-apply">
    <!-- 搜索 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-input v-model="search.sponsorName" placeholder="发起人姓名" clearable style="width: 200px" />
        <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="待审核" :value="1" />
          <el-option label="已通过" :value="2" />
          <el-option label="已驳回" :value="3" />
          <el-option label="已撤回" :value="4" />
        </el-select>
        <el-date-picker
          v-model="search.planStartTime"
          type="datetime"
          placeholder="计划开始时间"
          value-format="yyyy-MM-dd'T'HH:mm:ss"
          style="width: 220px"
        />
        <el-date-picker
          v-model="search.planEndTime"
          type="datetime"
          placeholder="计划结束时间"
          value-format="yyyy-MM-dd'T'HH:mm:ss"
          style="width: 220px"
        />
        <el-checkbox v-model="search.onlyMy">只看我发起的</el-checkbox>
        <el-checkbox v-model="search.onlyJoined">只看我参与的</el-checkbox>
        <el-button type="primary" @click="handleSearch">搜索喵</el-button>
        <el-button @click="resetSearch">重置喵</el-button>
      </div>
    </el-card>

    <!-- 活动列表 -->
    <el-table :data="list" border style="width: 100%;" v-loading="loading">
      <el-table-column prop="remark" label="活动标题" align="center" />
      <el-table-column prop="sponsorName" label="发起人" align="center" />
      <el-table-column prop="sponsorTime" label="发起时间" align="center">
        <template #default="scope">{{ formatDateTime(scope.row.sponsorTime) }}</template>
      </el-table-column>
      <el-table-column prop="planStartTime" label="计划开始时间" align="center">
        <template #default="scope">{{ formatDateTime(scope.row.planStartTime) }}</template>
      </el-table-column>
      <el-table-column prop="planEndTime" label="计划结束时间" align="center">
        <template #default="scope">{{ formatDateTime(scope.row.planEndTime) }}</template>
      </el-table-column>
      <el-table-column prop="planSite" label="地点" align="center" />
      <el-table-column label="已报名人员" align="center">
        <template #default="scope">
          {{ scope.row.planJoinNameUsers?.map(u => u.name).join(', ') || '无喵' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">{{ formatStatus(scope.row.status) }}</template>
      </el-table-column>

      <!-- 操作栏 -->
      <el-table-column label="操作" width="300" align="center">
        <template #default="scope">
          <template v-if="isAdmin">
            <el-button size="mini" @click="editActivity(scope.row)">编辑喵</el-button>
            <el-button size="mini" type="success" @click="approveActivity(scope.row)">通过喵</el-button>
            <el-button size="mini" type="danger" @click="rejectActivity(scope.row)">驳回喵</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="joinActivity(scope.row.id)">参加喵</el-button>
            <el-button size="mini" type="danger" @click="quitActivity(scope.row.id)">退出喵</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
  name: 'AppActivityApply',
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      pageRequest: {
        pageNo: 1,
        pageSize: 10,
        orderByItems: [{ column: 'planStartTime', asc: false }]
      },
      search: {
        sponsorName: '',
        status: null,
        planStartTime: null,
        planEndTime: null,
        onlyMy: false,
        onlyJoined: false
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      const userId = Number(localStorage.getItem('userId'))
      const payload = {
        pageRequest: { ...this.pageRequest },
        sponsorName: this.search.sponsorName,
        status: this.search.status,
        planStartTime: this.search.planStartTime,
        planEndTime: this.search.planEndTime,
        sponsorId: this.search.onlyMy ? userId : null,
        planJoinUserId: this.search.onlyJoined ? userId : null
      }
      service.post('/activity/pageActivityApply', payload)
        .then(res => {
          this.list = res.results || []
          this.total = res.total || 0
        })
        .finally(() => { this.loading = false })
    },
    handleSearch() {
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    resetSearch() {
      this.search = { sponsorName: '', status: null, planStartTime: null, planEndTime: null, onlyMy: false, onlyJoined: false }
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const pad = (n) => (n < 10 ? '0' + n : n)
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    formatStatus(status) {
      switch (status) {
        case 1: return '待审核'
        case 2: return '已通过'
        case 3: return '已驳回'
        case 4: return '已撤回'
        default: return '-'
      }
    },
    editActivity(row) {
      this.$prompt('请输入新的活动标题喵～', '编辑活动', {
        confirmButtonText: '保存喵',
        cancelButtonText: '取消',
        inputValue: row.remark || ''
      }).then(({ value }) => {
        const payload = {
          id: row.id,
          sponsorTime: row.sponsorTime,
          planStartTime: row.planStartTime,
          planEndTime: row.planEndTime,
          planSite: row.planSite,
          status: row.status,
          remark: value
        }
        service.post('/activity/updateActivityApply', payload).then(() => {
          this.$message.success('编辑成功喵～')
          this.fetchData()
        })
      }).catch(() => {})
    },
    approveActivity(row) {
      const payload = {
        id: row.id,
        sponsorTime: row.sponsorTime,
        planStartTime: row.planStartTime,
        planEndTime: row.planEndTime,
        planSite: row.planSite,
        status: 2,  // 审核通过
        remark: row.remark || '系统审核通过喵～'
      }
      service.post('/activity/updateActivityApply', payload).then(() => {
        this.$message.success('审核通过喵～')
        this.fetchData()
      })
    },
    rejectActivity(row) {
      const payload = {
        id: row.id,
        sponsorTime: row.sponsorTime,
        planStartTime: row.planStartTime,
        planEndTime: row.planEndTime,
        planSite: row.planSite,
        status: 3, // 审核驳回
        remark: row.remark || '系统审核驳回喵～'
      }
      service.post('/activity/updateActivityApply', payload).then(() => {
        this.$message.success('审核驳回喵～')
        this.fetchData()
      })
    },
    joinActivity(id) {
      service.post('/activity/joinActivity', { activityId: id }).then(() => {
        this.$message.success('参加成功喵～')
        this.fetchData()
      })
    },
    quitActivity(id) {
      service.post('/activity/quitActivity', { activityId: id }).then(() => {
        this.$message.success('退出成功喵～')
        this.fetchData()
      })
    }
  }
}
</script>

<style scoped>
.app-activity-apply {
  padding: 20px;
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
