<template>
    <div class="app-dictionary-type-admin">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.name" placeholder="请输入类型名称" clearable style="width: 200px" />
          <el-input v-model="search.code" placeholder="请输入类型编码" clearable style="width: 200px" />
          <el-select v-model="search.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" style="float:right" @click="openAdd">新增类型</el-button>
        </div>
      </el-card>
  
      <!-- 表格 -->
      <el-table :data="list" border style="width: 100%;" v-loading="loading">
        <el-table-column prop="name" label="类型名称" align="center" />
        <el-table-column prop="code" label="编码" align="center" />
        <el-table-column prop="remark" label="描述" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
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
  
      <!-- 弹窗 -->
      <el-dialog :title="isEdit ? '编辑类型' : '新增类型'" :visible.sync="dialogVisible" width="600px">
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="编码" prop="code">
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input v-model="form.remark" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
    name: 'AppDictionaryTypeAdmin',
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
          code: '',
          remark: '',
          status: 1
        },
        search: {
          name: '',
          code: '',
          status: null
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        },
        rules: {
          name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
          code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }]
        }
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.loading = true
        const payload = {
          pageRequest: { ...this.pageRequest },
          ...this.search
        }
        service.post('/dictionary/pageDictionaryType', payload)
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
        this.search = { name: '', code: '', status: null }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      openAdd() {
        this.isEdit = false
        this.form = { id: null, name: '', code: '', remark: '', status: 1 }
        this.dialogVisible = true
      },
      openEdit(row) {
        this.isEdit = true
        this.form = { ...row }
        this.dialogVisible = true
      },
      submitForm() {
        this.$refs.form.validate(valid => {
          if (valid) {
            const url = this.isEdit ? '/dictionary/updateDictionaryType' : '/dictionary/addDictionaryType'
            service.post(url, this.form)
              .then(() => {
                this.$message.success(this.isEdit ? '更新成功' : '新增成功')
                this.dialogVisible = false
                this.fetchData()
              })
          }
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-dictionary-type-admin {
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
  