<template>
  <div class="app-change-record-tab">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-input v-model="search.userId" placeholder="用户ID" clearable style="width: 180px" />
        <el-select v-model="search.type" placeholder="异动类型" clearable style="width: 180px">
          <el-option v-for="(label, val) in typeMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-date-picker
          v-model="search.changeTimeRange"
          type="daterange"
          start-placeholder="变更起"
          end-placeholder="变更止"
          style="width: 300px"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-table :data="list" border stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="userId" label="用户ID" align="center" width="100" />
      <el-table-column label="用户名" align="center" width="150">
        <template #default="scope">
          {{ userMap[scope.row.userId] || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="异动类型" align="center">
        <template #default="scope">
          {{ typeMap[scope.row.type] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="原部门" align="center">
        <template #default="scope">
          {{ getDeptDisplay(scope.row.oldDepartmentId) }}
        </template>
      </el-table-column>
      <el-table-column label="新部门" align="center">
        <template #default="scope">
          {{ getDeptDisplay(scope.row.newDepartmentId) }}
        </template>
      </el-table-column>
      <el-table-column prop="planChangeTime" label="计划变更时间" align="center" />
      <el-table-column prop="planLeaveTime" label="计划离社时间" align="center" />
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-select
            v-model="scope.row.status"
            size="mini"
            @change="updateStatus(scope.row)"
            placeholder="请选择"
          >
            <el-option :value="0" label="无效" />
            <el-option :value="1" label="生效" />
          </el-select>
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
import axios from '@/utils/axios'

export default {
  name: 'AppChangeRecordTab',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      departmentMap: {},
      userMap: {},
      search: {
        userId: '',
        type: null,
        changeTimeRange: []
      },
      pageRequest: {
        pageNo: 1,
        pageSize: 10
      },
      typeMap: {
        0: '入职',
        1: '部门调整',
        2: '岗位调整',
        3: '晋升',
        4: '降职',
        5: '转正'
      }
    }
  },
  created() {
    this.loadDepartmentMap()
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      const [planChangeStartTime, planChangeEndTime] = this.search.changeTimeRange || []
      axios
        .post('/change/pageChangeRecord', {
          pageRequest: { ...this.pageRequest },
          userId: this.search.userId,
          type: this.search.type,
          planChangeStartTime,
          planChangeEndTime
        })
        .then(async res => {
          this.list = res.results || []
          this.total = res.total || 0
          await this.loadUserMapByRecords(this.list)
        })
        .finally(() => {
          this.loading = false
        })
    },
    async loadUserMapByRecords(records) {
      const ids = Array.from(new Set(records.map(r => r.userId)))
      if (!ids.length) return
      const res = await axios.post('/user/pageUserInfo', {
        pageRequest: { pageNo: 1, pageSize: 1000 },
        idList: ids
      })
      const map = {}
      for (const u of res.results || []) {
        map[u.id] = u.name
      }
      this.userMap = map
    },
    updateStatus(row) {
      axios.post('/change/updateChangeRecord', {
        id: row.id,
        status: row.status
      }).then(() => {
        this.$message.success('状态已更新')
      })
    },
    handleSearch() {
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    resetSearch() {
      this.search = { userId: '', type: null, changeTimeRange: [] }
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    loadDepartmentMap() {
      axios.post('/department/listDepartmentTree').then(res => {
        const flatten = (nodes, map = {}) => {
          for (const node of nodes || []) {
            map[node.id] = node.name
            if (node.children) flatten(node.children, map)
          }
          return map
        }
        this.departmentMap = flatten(res)
      })
    },
    getDeptDisplay(id) {
      return this.departmentMap[id] || '-'
    }
  }
}
</script>

<style scoped>
.app-change-record-tab {
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
</style>
