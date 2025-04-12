<template>
    <div class="app-announcement-admin">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-select v-model="search.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" :value="1" />
            <el-option label="待发布" :value="2" />
            <el-option label="已发布" :value="3" />
            <el-option label="已下架" :value="4" />
          </el-select>
  
          <el-date-picker
            v-model="search.planReleaseTime"
            type="date"
            placeholder="选择计划发布时间"
            value-format="yyyy-MM-dd"
            clearable
          />
  
          <el-date-picker
            v-model="search.releaseTime"
            type="date"
            placeholder="选择实际发布时间"
            value-format="yyyy-MM-dd"
            clearable
          />
  
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" style="margin-left:auto;" @click="openAdd">新增公告</el-button>
        </div>
      </el-card>
  
      <!-- 公告列表 -->
      <el-table :data="list" border style="width: 100%;" v-loading="loading">
        <el-table-column prop="content" label="内容" align="left" />
        <el-table-column prop="status" label="状态" :formatter="formatStatus" align="center" />
        <el-table-column prop="planReleaseTime" label="计划发布时间" align="center" />
        <el-table-column prop="releaseTime" label="发布时间" align="center" />
        <el-table-column label="操作" align="center" width="150">
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
  
      <!-- 新增/编辑弹窗 -->
      <el-dialog :title="isEdit ? '编辑公告' : '新增公告'" :visible.sync="dialogVisible" width="600px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="内容">
            <el-input type="textarea" rows="4" v-model="form.content" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="草稿" :value="1" />
              <el-option label="待发布" :value="2" />
              <el-option label="已发布" :value="3" />
              <el-option label="已下架" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="计划发布时间">
            <el-date-picker
              v-model="form.planReleaseTime"
              type="datetime"
              placeholder="选择计划发布时间"
            />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="form.releaseTime"
              type="datetime"
              placeholder="选择发布时间"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="saving">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="saving">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import service from '@/utils/axios'
  
  export default {
    name: 'AppAnnouncementAdmin',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        saving: false,
        dialogVisible: false,
        isEdit: false,
        form: {
          id: null,
          content: '',
          status: 1,
          planReleaseTime: null,
          releaseTime: null
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10,
          orderByItems: [{ column: 'planReleaseTime', asc: false }]
        },
        search: {
          status: null,
          planReleaseTime: null,
          releaseTime: null   // ✅ 新增实际发布时间搜索条件
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      formatStatus(row) {
        switch (row.status) {
          case 1: return '草稿'
          case 2: return '待发布'
          case 3: return '已发布'
          case 4: return '已下架'
          default: return '-'
        }
      },
      formatDateTime(date) {
        if (!(date instanceof Date)) return null
        const pad = (n) => (n < 10 ? '0' + n : n)
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      },
      fetchData() {
        this.loading = true
        const payload = {
          pageRequest: { ...this.pageRequest },
          ...(this.search.status ? { status: this.search.status } : {}),
          ...(this.search.planReleaseTime ? { planReleaseTime: this.search.planReleaseTime + 'T00:00:00' } : {}),
          ...(this.search.releaseTime ? { releaseTime: this.search.releaseTime + 'T00:00:00' } : {})
        }
        service.post('/announcement/pageAnnouncement', payload)
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
        this.search = { status: null, planReleaseTime: null, releaseTime: null }
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
          content: '',
          status: 1,
          planReleaseTime: null,
          releaseTime: null
        }
        this.dialogVisible = true
      },
      openEdit(row) {
        this.isEdit = true
        this.form = {
          id: row.id,
          content: row.content,
          status: row.status,
          planReleaseTime: row.planReleaseTime ? new Date(row.planReleaseTime) : null,
          releaseTime: row.releaseTime ? new Date(row.releaseTime) : null
        }
        this.dialogVisible = true
      },
      submitForm() {
        this.saving = true
        const userId = localStorage.getItem('userId')
        const payload = {
          content: this.form.content,
          status: this.form.status,
          planReleaseTime: this.form.planReleaseTime ? this.formatDateTime(this.form.planReleaseTime) : null,
          releaseTime: this.form.releaseTime ? this.formatDateTime(this.form.releaseTime) : null
        }
        if (this.isEdit) {
          payload.id = this.form.id
          payload.userId = userId ? parseInt(userId) : null
          service.post('/announcement/updateAnnouncement', payload)
            .then(() => {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.fetchData()
            })
            .finally(() => {
              this.saving = false
            })
        } else {
          service.post('/announcement/addAnnouncement', payload)
            .then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.pageRequest.pageNo = 1
              this.fetchData()
            })
            .finally(() => {
              this.saving = false
            })
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .app-announcement-admin {
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
  .dialog-footer {
    text-align: right;
  }
  </style>
  