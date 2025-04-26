<template>
    <div class="app-role-admin">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-input v-model="search.name" placeholder="角色名称" clearable style="width: 180px" />
          <el-input v-model="search.code" placeholder="角色编码" clearable style="width: 180px" />
          <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openAddDialog" style="margin-left: auto;">新增角色</el-button>
        </div>
      </el-card>
  
      <!-- 角色列表 -->
      <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" align="center" width="80" />
        <el-table-column prop="name" label="角色名称" align="center" />
        <el-table-column prop="code" label="角色编码" align="center" />
        <el-table-column prop="remark" label="备注" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
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
  
      <!-- 新增/编辑角色弹窗 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="角色名称" required>
            <el-input v-model="form.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色编码" required>
            <el-input v-model="form.code" placeholder="请输入角色编码" />
          </el-form-item>
          <el-form-item label="状态" required>
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="禁用" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios'
  
  export default {
    name: 'AppRoleAdmin',
    data() {
      return {
        list: [],
        total: 0,
        loading: false,
        search: {
          name: '',
          code: '',
          status: null
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        },
        dialogVisible: false,
        dialogTitle: '',
        form: {
          id: null,
          name: '',
          code: '',
          status: 1,
          remark: ''
        },
        isEdit: false
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.loading = true
        axios.post('/role/pageRole', {
          pageRequest: this.pageRequest,
          ...this.search
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
        this.search = {
          name: '',
          code: '',
          status: null
        }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      openAddDialog() {
        this.dialogTitle = '新增角色'
        this.isEdit = false
        this.form = {
          id: null,
          name: '',
          code: '',
          status: 1,
          remark: ''
        }
        this.dialogVisible = true
      },
      openEditDialog(role) {
        this.dialogTitle = '编辑角色'
        this.isEdit = true
        this.form = { ...role }
        this.dialogVisible = true
      },
      submitForm() {
        const url = this.isEdit ? '/role/updateRole' : '/role/addRole'
        const payload = { ...this.form }
        axios.post(url, payload).then(() => {
          this.$message.success('保存成功')
          this.dialogVisible = false
          this.fetchData()
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .app-role-admin {
    padding-top: 10px;
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
  