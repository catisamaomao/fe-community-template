<template>
  <div class="app-documentation-admin">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-input v-model="search.title" placeholder="请输入资料标题" clearable style="width: 200px" />
        <el-select v-model="search.documentationType" placeholder="请选择分类" clearable style="width: 150px">
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="search.status" placeholder="请选择状态" clearable style="width: 120px">
          <el-option label="草稿" :value="0" />
          <el-option label="已发布" :value="1" />
          <el-option label="已下架" :value="2" />
        </el-select>
        <el-date-picker v-model="search.planReleaseTime" type="daterange" start-placeholder="计划发布时间起" end-placeholder="计划发布时间止" value-format="yyyy-MM-dd" clearable />
        <el-date-picker v-model="search.releaseTime" type="daterange" start-placeholder="实际发布时间起" end-placeholder="实际发布时间止" value-format="yyyy-MM-dd" clearable />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" style="float:right" @click="openAdd">新增资料</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-table :data="list" border style="width: 100%;" v-loading="loading">
      <el-table-column prop="title" label="标题" align="left" />
      <el-table-column label="分类" align="center">
        <template #default="scope">
          {{ getTypeName(scope.row.documentationType) }}
        </template>
      </el-table-column>
      <el-table-column prop="providerName" label="提供者" align="center" />
      <el-table-column label="链接" align="center">
        <template #default="scope">
          <el-link 
            :href="scope.row.url" 
            target="_blank" 
            v-if="scope.row.url"
            type="primary"
          >
            点击跳转
          </el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" :formatter="formatStatus" align="center" />
      <el-table-column prop="planReleaseTime" label="计划发布时间" align="center" />
      <el-table-column prop="releaseTime" label="实际发布时间" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="primary" @click="openEditUrl(scope.row)">编辑文件链接</el-button>
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

    <!-- 弹窗 新增/编辑 -->
    <el-dialog :title="isEdit ? '编辑资料' : '新增资料'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.documentationType" placeholder="请选择分类" multiple>
            <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已下架" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划发布时间">
          <el-date-picker v-model="form.planReleaseTime" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" placeholder="选择计划发布时间" />
        </el-form-item>
        <el-form-item label="实际发布时间">
          <el-date-picker v-model="form.releaseTime" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" placeholder="选择实际发布时间" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>

    <!-- 弹窗 编辑文件链接 -->
    <el-dialog title="编辑文件链接" :visible.sync="editUrlDialogVisible" width="500px">
      <div v-if="editUrlForm.url" style="margin-bottom: 20px; text-align: center;">
        当前链接：
        <el-link :href="editUrlForm.url" target="_blank" type="primary">点击跳转</el-link>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <el-radio-group v-model="editMode" size="small">
          <el-radio-button label="upload">上传文件</el-radio-button>
          <el-radio-button label="manual">手动填写链接</el-radio-button>
        </el-radio-group>
      </div>

      <div style="text-align: center;">
        <div v-if="editMode === 'upload'">
          <el-upload
            :action="uploadDocumentUrl"
            :data="{ documentId: editUrlForm.id }"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
          >
            <el-button type="primary" :loading="uploading">上传文件</el-button>
          </el-upload>

          <el-progress
            v-if="uploading"
            :percentage="uploadPercent"
            status="active"
            style="margin-top: 15px; width: 300px;"
          />

          <div style="margin-top: 10px; font-size: 12px; color: #999;">支持任意格式文件，上传必须在10分钟内完成</div>
        </div>

        <div v-else style="padding: 0 40px;">
          <el-input v-model="editUrlForm.url" placeholder="请输入文件链接"></el-input>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editUrlDialogVisible = false">取消</el-button>
        <el-button type="primary" v-if="editMode === 'manual'" @click="submitEditUrl">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/axios'

export default {
  name: 'AppDocumentationAdmin',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      editUrlDialogVisible: false,
      isEdit: false,
      uploading: false,
      uploadStartTime: null,
      uploadPercent: 0,
      form: {
        id: null,
        title: '',
        url: '',
        documentationType: [],
        status: 0,
        planReleaseTime: null,
        releaseTime: null
      },
      search: {
        title: '',
        documentationType: null,
        status: null,
        planReleaseTime: [],
        releaseTime: []
      },
      typeOptions: [],
      pageRequest: {
        pageNo: 1,
        pageSize: 10,
        orderByItems: [{ column: 'releaseTime', asc: false }]
      },
      editUrlForm: {
        id: null,
        url: ''
      },
      editMode: 'upload'
    }
  },
  computed: {
    uploadDocumentUrl() {
      return process.env.VUE_APP_API_BASE + '/file/uploadDocument'
    }
  },
  created() {
    this.fetchData()
    this.fetchTypes()
  },
  methods: {
    formatStatus(row) {
      switch (row.status) {
        case 0: return '草稿'
        case 1: return '已发布'
        case 2: return '已下架'
        default: return '-'
      }
    },
    getTypeName(typeIds) {
      if (!Array.isArray(typeIds)) return '-'
      const names = typeIds.map(id => {
        const found = this.typeOptions.find(item => item.id === id)
        return found ? found.name : null
      }).filter(name => !!name)
      return names.length > 0 ? names.join(', ') : '-'
    },
    fetchData() {
      this.loading = true
      const payload = {
        pageRequest: { ...this.pageRequest },
        title: this.search.title,
        documentationType: this.search.documentationType,
        status: this.search.status,
        planReleaseTimeStart: this.search.planReleaseTime?.[0] ? this.search.planReleaseTime[0] + 'T00:00:00' : null,
        planReleaseTimeEnd: this.search.planReleaseTime?.[1] ? this.search.planReleaseTime[1] + 'T23:59:59' : null,
        releaseTimeStart: this.search.releaseTime?.[0] ? this.search.releaseTime[0] + 'T00:00:00' : null,
        releaseTimeEnd: this.search.releaseTime?.[1] ? this.search.releaseTime[1] + 'T23:59:59' : null,
      }
      service.post('/documentation/pageDocumentation', payload)
        .then(res => {
          this.list = res.results || []
          this.total = res.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchTypes() {
      service.post('/documentation/pageDocumentationType', {
        pageRequest: { pageNo: 1, pageSize: 100 }
      }).then(res => {
        this.typeOptions = res.results || []
      })
    },
    handleSearch() {
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    resetSearch() {
      this.search = { title: '', documentationType: null, status: null, planReleaseTime: [], releaseTime: [] }
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
        title: '',
        url: '',
        documentationType: [],
        status: 0,
        planReleaseTime: null,
        releaseTime: null
      }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },
    submitForm() {
      const url = this.isEdit ? '/documentation/updateDocumentation' : '/documentation/addDocumentation'
      service.post(url, { ...this.form }).then(() => {
        this.$message.success(this.isEdit ? '更新成功' : '新增成功')
        this.dialogVisible = false
        this.fetchData()
      })
    },
    openEditUrl(row) {
      this.editUrlForm = {
        id: row.id,
        url: row.url || ''
      }
      this.editMode = 'upload'
      this.editUrlDialogVisible = true
    },
    beforeUpload() {
      this.uploadStartTime = new Date().getTime()
      this.uploading = true
      return true
    },
    handleUploadProgress(event) {
      this.uploadPercent = Math.round(event.percent)
    },
    handleUploadSuccess() {
      const now = new Date().getTime()
      const duration = (now - this.uploadStartTime) / 1000

      this.uploading = false
      this.uploadPercent = 0

      if (duration > 600) {
        this.$message.error('上传超时，超过10分钟，请重新上传')
      } else {
        this.$message.success('上传成功')
        this.editUrlDialogVisible = false
        this.fetchData()
      }
    },
    handleUploadError() {
      this.uploading = false
      this.uploadPercent = 0
      this.$message.error('上传失败')
    },
    submitEditUrl() {
      service.post('/documentation/updateDocumentation', {
        id: this.editUrlForm.id,
        url: this.editUrlForm.url
      }).then(() => {
        this.$message.success('链接保存成功')
        this.editUrlDialogVisible = false
        this.fetchData()
      })
    }
  }
}
</script>

<style scoped>
.app-documentation-admin {
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
