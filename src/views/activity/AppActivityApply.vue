<template>
  <div class="app-activity-apply">
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-select v-model="search.status" placeholder="状态" style="width: 120px" clearable>
          <el-option label="待审核" :value="1" />
          <el-option label="已通过" :value="2" />
          <el-option label="已驳回" :value="3" />
          <el-option label="已撤回" :value="4" />
        </el-select>
        <el-input v-model="search.sponsorName" placeholder="发起人姓名" clearable style="width: 200px" />
        <el-date-picker
          v-model="search.planTime"
          type="daterange"
          start-placeholder="计划开始时间"
          end-placeholder="计划结束时间"
          value-format="yyyy-MM-dd"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" style="float:right" @click="openAdd">新增申请</el-button>
      </div>
    </el-card>

    <el-table :data="list" border style="width: 100%;" v-loading="loading">
      <el-table-column prop="sponsorName" label="发起人" align="center" />
      <el-table-column prop="planSite" label="计划地点" align="center" />
      <el-table-column prop="planStartTime" label="计划开始时间" align="center" />
      <el-table-column prop="planEndTime" label="计划结束时间" align="center" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" align="center" />
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
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

    <el-dialog :title="isEdit ? '编辑申请' : '新增申请'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="计划地点">
          <el-input v-model="form.planSite" />
        </el-form-item>
        <el-form-item label="计划时间">
          <el-date-picker
            v-model="form.planTimes"
            type="datetimerange"
            start-placeholder="计划开始时间"
            end-placeholder="计划结束时间"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            range-separator="至"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/axios'

export default {
  name: 'AppActivityApply',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        planSite: '',
        planTimes: []
      },
      search: {
        status: null,
        sponsorName: '',
        planTime: []
      },
      pageRequest: {
        pageNo: 1,
        pageSize: 10,
        orderByItems: [{ column: 'planStartTime', asc: false }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    formatStatus(row) {
      switch (row.status) {
        case 1: return '待审核'
        case 2: return '已通过'
        case 3: return '已驳回'
        case 4: return '已撤回'
        default: return '-'
      }
    },
    fetchData() {
      this.loading = true
      const payload = {
        pageRequest: { ...this.pageRequest },
        status: this.search.status,
        sponsorName: this.search.sponsorName,
        planStartTime: this.search.planTime?.[0] ? this.search.planTime[0] + 'T00:00:00' : null,
        planEndTime: this.search.planTime?.[1] ? this.search.planTime[1] + 'T23:59:59' : null
      }
      service.post('/activity/pageActivityApply', payload)
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
      this.search = { status: null, sponsorName: '', planTime: [] }
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    openAdd() {
      this.isEdit = false
      this.form = { id: null, planSite: '', planTimes: [] }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isEdit = true
      this.form = {
        id: row.id,
        planSite: row.planSite,
        planTimes: [row.planStartTime, row.planEndTime]
      }
      this.dialogVisible = true
    },
    submitForm() {
      const url = this.isEdit ? '/activity/updateActivityApply' : '/activity/addActivityApply'
      const [planStartTime, planEndTime] = this.form.planTimes || []
      service.post(url, {
        ...this.form,
        planStartTime,
        planEndTime
      }).then(() => {
        this.$message.success(this.isEdit ? '更新成功' : '新增成功')
        this.dialogVisible = false
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
