<template>
  <div class="app-entry-apply-tab">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-select v-model="search.status" placeholder="申请状态" clearable style="width: 150px">
          <el-option label="待处理" :value="1" />
          <el-option label="通过" :value="2" />
          <el-option label="拒绝" :value="3" />
        </el-select>
        <el-date-picker
          v-model="search.dateRange"
          type="daterange"
          start-placeholder="申请时间起"
          end-placeholder="申请时间止"
          value-format="yyyy-MM-dd"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" style="float:right" @click="openAdd">新增申请</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-table :data="list" border stripe style="width: 100%;" v-loading="loading">
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column prop="school" label="学校" align="center" />
      <el-table-column prop="studentNum" label="学号" align="center" />
      <el-table-column prop="sex" label="性别" align="center">
        <template #default="scope">
          {{ scope.row.sex === 1 ? '男' : scope.row.sex === 2 ? '女' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          {{ getStatusLabel(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
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

    <!-- 弹窗：新增 / 编辑 -->
    <el-dialog :title="isEdit ? '编辑申请' : '新增申请'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="form.school" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="form.studentNum" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待处理" :value="1" />
            <el-option label="通过" :value="2" />
            <el-option label="拒绝" :value="3" />
          </el-select>
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
  name: 'AppEntryApplyTab',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        name: '',
        phone: '',
        email: '',
        school: '',
        studentNum: '',
        sex: null,
        status: 1
      },
      search: {
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
    getStatusLabel(status) {
      switch (status) {
        case 1: return '待处理'
        case 2: return '通过'
        case 3: return '拒绝'
        default: return '-'
      }
    },
    fetchData() {
      this.loading = true
      const [startTime, endTime] = this.search.dateRange || []
      service.post('/entry/pageEntryApply', {
        pageRequest: { ...this.pageRequest },
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
      this.search = { status: null, dateRange: [] }
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    openAdd() {
      this.isEdit = false
      this.form = {
        id: null,
        name: '',
        phone: '',
        email: '',
        school: '',
        studentNum: '',
        sex: null,
        status: 1
      }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },
    submitForm() {
      const url = this.isEdit ? '/entry/updateEntryApply' : '/entry/addEntryApply'
      service.post(url, this.form).then(() => {
        this.$message.success(this.isEdit ? '更新成功' : '新增成功')
        this.dialogVisible = false
        this.fetchData()
      })
    }
  }
}
</script>

<style scoped>
.app-entry-apply-tab {
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
.dialog-footer {
  text-align: right;
}
</style>
