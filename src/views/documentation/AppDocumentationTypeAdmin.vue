<template>
    <div class="app-documentation-type-admin">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.name" placeholder="分类名称" clearable style="width: 200px;" />
          <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px;">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" style="float: right;" @click="openAdd">新增分类</el-button>
        </div>
      </el-card>
  
      <!-- 表格 -->
      <el-table :data="list" border style="width: 100%;" v-loading="loading">
        <el-table-column prop="name" label="分类名称" align="left" />
        <el-table-column prop="code" label="分类编码" align="center" />
        <el-table-column prop="status" label="状态" :formatter="formatStatus" align="center" />
        <el-table-column prop="remark" label="分类说明" align="left" />
        <el-table-column label="操作" align="center" width="120">
          <template #default="scope">
            <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
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
  
      <!-- 新增/编辑弹窗 -->
      <el-dialog :title="isEdit ? '编辑分类' : '新增分类'" :visible.sync="dialogVisible" width="500px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="分类名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="分类编码">
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类说明">
            <el-input v-model="form.remark" />
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
    name: 'AppDocumentationTypeAdmin',
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
          name: '',
          code: '',
          status: 1,
          remark: ''
        },
        search: {
          name: '',
          status: null
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10,
          orderByItems: [{ column: 'createTime', asc: false }]
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      formatStatus(row) {
        return row.status === 1 ? '启用' : '停用'
      },
      fetchData() {
        this.loading = true
        const payload = {
          pageRequest: { ...this.pageRequest },
          name: this.search.name || null,
          status: this.search.status
        }
        service.post('/documentation/pageDocumentationType', payload)
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
        this.search = { name: '', status: null }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      openAdd() {
        this.isEdit = false
        this.form = { id: null, name: '', code: '', status: 1, remark: '' }
        this.dialogVisible = true
      },
      openEdit(row) {
        this.isEdit = true
        this.form = { ...row }
        this.dialogVisible = true
      },
      submitForm() {
        this.saving = true
        const payload = {
          id: this.form.id,
          name: this.form.name,
          code: this.form.code,
          status: this.form.status,
          remark: this.form.remark
        }
        const url = this.isEdit ? '/documentation/updateDocumentationType' : '/documentation/addDocumentationType'
        service.post(url, payload)
          .then(() => {
            this.$message.success(this.isEdit ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.fetchData()
          })
          .finally(() => {
            this.saving = false
          })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-documentation-type-admin {
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
  