<template>
  <div class="app-user-role-config">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-input v-model="search.userId" placeholder="用户ID" clearable style="width: 180px" />
        <el-input v-model="search.userName" placeholder="姓名" clearable style="width: 180px" />
        <el-select v-model="search.roleId" placeholder="选择角色" clearable style="width: 180px">
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="用户ID" align="center" width="100" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="roleNames" label="角色" align="center">
        <template #default="scope">
          <span v-if="scope.row.roleNames.length">
            {{ scope.row.roleNames.join(', ') }}
          </span>
          <span v-else class="text-muted">暂无角色</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="openRoleDialog(scope.row)">配置角色</el-button>
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

    <!-- 配置角色弹窗 -->
    <el-dialog title="配置用户角色" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户姓名">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'AppUserRoleConfig',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      search: {
        userId: '',
        userName: '',
        roleId: null
      },
      pageRequest: {
        pageNo: 1,
        pageSize: 10
      },
      dialogVisible: false,
      form: {
        userId: null,
        name: '',
        roleIds: []
      },
      roleList: []
    }
  },
  created() {
    this.restorePageRequest()
    this.fetchAllRoles()
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      axios.post('/role/pageUserRoleRelation', {
        pageRequest: this.pageRequest,
        userId: this.search.userId ? Number(this.search.userId) : null,
        userName: this.search.userName,
        roleId: this.search.roleId
      }).then(res => {
        this.list = (res.results || []).map(user => ({
          id: user.userId,
          name: user.userName,
          roleNames: (user.roles || []).map(role => role.name)
        }))
        this.total = res.total || 0
        this.savePageRequest()
      }).finally(() => {
        this.loading = false
      })
    },
    fetchAllRoles() {
      axios.post('/role/listRole').then(res => {
        this.roleList = res || []
      })
    },
    handleSearch() {
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    resetSearch() {
      this.search.userId = ''
      this.search.userName = ''
      this.search.roleId = null
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    openRoleDialog(user) {
      this.form.userId = user.id
      this.form.name = user.name
      this.form.roleIds = []

      axios.post('/role/getRoleByUserId', { userId: user.id }).then(res => {
        this.form.roleIds = (res || []).map(role => role.id)
        this.dialogVisible = true
      })
    },
    submitRoleConfig() {
      axios.post('/user/updateRole', {
        id: this.form.userId,
        roleIds: this.form.roleIds
      }).then(() => {
        this.$message.success('角色配置成功')
        this.dialogVisible = false
        this.fetchData()
      })
    },
    savePageRequest() {
      localStorage.setItem('userRolePageNo', this.pageRequest.pageNo)
      localStorage.setItem('userRolePageSize', this.pageRequest.pageSize)
    },
    restorePageRequest() {
      const savedPageNo = parseInt(localStorage.getItem('userRolePageNo'))
      const savedPageSize = parseInt(localStorage.getItem('userRolePageSize'))
      if (savedPageNo && !isNaN(savedPageNo)) {
        this.pageRequest.pageNo = savedPageNo
      }
      if (savedPageSize && !isNaN(savedPageSize)) {
        this.pageRequest.pageSize = savedPageSize
      }
    }
  }
}
</script>

<style scoped>
.app-user-role-config {
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
.text-muted {
  color: #999;
}
</style>
