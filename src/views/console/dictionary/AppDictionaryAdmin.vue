<template>
    <div class="app-dictionary-admin">
      <!-- 搜索栏 -->
      <el-card class="toolbar-card">
        <div class="search-bar">
          <el-select v-model="search.typeId" placeholder="请选择字典类型喵～" clearable style="width: 200px">
            <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-input v-model="search.name" placeholder="请输入字典项名称喵～" clearable style="width: 200px" />
          <el-button type="primary" @click="handleSearch">喵喵搜索～(ฅ^･ω･^ ฅ)</el-button>
          <el-button @click="resetSearch">重置一下ฅʕ•̫͡•ʔฅ</el-button>
          <el-button type="primary" style="float:right" @click="openAdd">➕ 新增字典项喵～</el-button>
        </div>
      </el-card>
  
      <!-- 表格区域加一层，支持横向滚动 -->
      <div class="table-wrapper">
        <el-table :data="list" border style="width: 100%; min-width: 1000px;" v-loading="loading">
          <el-table-column prop="name" label="字典项名称" align="center" />
          <el-table-column prop="code" label="编码" align="center" />
          <el-table-column prop="value" label="值" align="center" />
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '✨ 启用中 ✨' : '休眠中...zzz' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button size="mini" @click="openEdit(scope.row)">编辑编辑喵～(≧◡≦)</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  
      <!-- 分页器喵 -->
      <el-pagination
        background
        layout="prev, pager, next, total"
        :current-page="pageRequest.pageNo"
        :page-size="pageRequest.pageSize"
        :total="total"
        @current-change="handlePageChange"
        class="pagination"
      />
  
      <!-- 弹窗窗窗喵 -->
      <el-dialog :title="isEdit ? '喵～编辑字典项' : '喵～新增字典项'" :visible.sync="dialogVisible" width="600px">
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="编码" prop="code">
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item label="值" prop="value">
            <el-input v-model="form.value" />
          </el-form-item>
          <el-form-item label="所属类型" prop="typeId">
            <el-select v-model="form.typeId" placeholder="选一个可爱的类型喵～">
              <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选状态喵～">
              <el-option label="✨ 启用" :value="1" />
              <el-option label="🌙 禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消～(●´∀｀●)</el-button>
          <el-button type="primary" @click="submitForm">保存嗷！(๑•̀ㅂ•́)و✧</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex'
  import service from '@/utils/axios'
  
  export default {
    name: 'AppDictionaryAdmin',
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
          value: '',
          typeId: null,
          status: 1
        },
        search: {
          name: '',
          typeId: null,
          status: null
        },
        pageRequest: {
          pageNo: 1,
          pageSize: 10
        },
        rules: {
          name: [{ required: true, message: '请输入名字喵～', trigger: 'blur' }],
          code: [{ required: true, message: '请输入编码喵～', trigger: 'blur' }],
          value: [{ required: true, message: '请输入值值喵～', trigger: 'blur' }],
          typeId: [{ required: true, message: '请选择类型喵～', trigger: 'change' }],
          status: [{ required: true, message: '请选择状态喵～', trigger: 'change' }]
        }
      }
    },
    computed: {
      ...mapState(['dictionaryOptions']),
      typeOptions() {
        return this.dictionaryOptions
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
        service.post('/dictionary/pageDictionary', payload)
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
        this.search = { name: '', typeId: null, status: null }
        this.pageRequest.pageNo = 1
        this.fetchData()
      },
      handlePageChange(page) {
        this.pageRequest.pageNo = page
        this.fetchData()
      },
      openAdd() {
        this.isEdit = false
        this.form = { id: null, name: '', code: '', value: '', typeId: null, status: 1 }
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
      const url = this.isEdit ? '/dictionary/updateDictionary' : '/dictionary/addDictionary'
      
      // 新增时去掉id字段
      const payload = { ...this.form }
      if (!this.isEdit) {
        delete payload.id
      }

      service.post(url, payload)
        .then(() => {
          this.$message.success(this.isEdit ? '编辑成功喵～！(ฅ>ω<*ฅ)' : '新增完成喵！ฅ^•ﻌ•^ฅ')
          this.dialogVisible = false
          this.fetchData()
          this.$store.dispatch('fetchDictionaryOptions')
        })
    }
  })
}

    }
  }
  </script>
  
  <style scoped>
  .app-dictionary-admin {
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
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 20px;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  .dialog-footer {
    text-align: right;
  }
  </style>
  