<template>
  <div class="app-user-info-tab">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <div class="search-bar">
        <el-input v-model="search.name" placeholder="姓名" clearable style="width: 180px" />
        <el-input v-model="search.id" placeholder="用户ID" clearable style="width: 150px" />
        <el-select v-model="search.status" placeholder="状态" clearable style="width: 150px">
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="禁用" />
        </el-select>
        <el-select v-model="search.type" placeholder="类型" clearable style="width: 150px">
          <el-option :value="0" label="开发者" />
          <el-option :value="1" label="普通成员" />
          <el-option :value="2" label="干部" />
          <el-option :value="3" label="管理员" />
        </el-select>
        <el-input v-model="search.school" placeholder="学校" clearable style="width: 200px" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </el-card>

    <!-- 表格展示 -->
    <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="用户ID" align="center" width="100" />
      <el-table-column label="头像" align="center" width="80">
        <template #default="scope">
          <el-avatar :src="scope.row.avatarUrl" size="small" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column prop="studentNum" label="学号" align="center" />
      <el-table-column prop="school" label="学校" align="center" />
      <el-table-column prop="love" label="兴趣爱好" align="center" />
      <el-table-column prop="motto" label="个性签名" align="center" />
      <el-table-column prop="type" label="类型" align="center">
        <template #default="scope">
          {{ typeMap[scope.row.type] || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <div class="action-buttons">
            <!-- 离社按钮 -->
            <div class="action-button">
              <template v-if="scope.row.status !== 1">
                <el-tooltip content="禁用用户不可操作" placement="top">
                  <el-button
                    size="mini"
                    type="warning"
                    :disabled="true"
                  >
                    离社
                  </el-button>
                </el-tooltip>
              </template>
              <template v-else>
                <el-button
                  size="mini"
                  type="warning"
                  @click="openLeaveDialog(scope.row)"
                >
                  离社
                </el-button>
              </template>
            </div>

            <!-- 异动按钮 -->
            <div class="action-button">
              <template v-if="scope.row.status !== 1">
                <el-tooltip content="禁用用户不可操作" placement="top">
                  <el-button
                    size="mini"
                    type="primary"
                    :disabled="true"
                  >
                    异动
                  </el-button>
                </el-tooltip>
              </template>
              <template v-else>
                <el-button
                  size="mini"
                  type="primary"
                  @click="openChangeDialog(scope.row)"
                >
                  异动
                </el-button>
              </template>
            </div>
          </div>
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

    <!-- 离社申请弹窗 -->
    <transition name="zoom-fade">
      <el-dialog
        title="新增离社申请"
        :visible.sync="leaveDialog.visible"
        width="400px"
        :modal-append-to-body="false"
      >
        <el-form :model="leaveDialog.form" label-width="100px">
          <el-form-item label="离社原因">
            <el-input type="textarea" v-model="leaveDialog.form.reason" placeholder="请输入原因" />
          </el-form-item>
          <el-form-item label="计划离社时间">
            <el-date-picker v-model="leaveDialog.form.planLeaveTime" type="datetime" placeholder="选择时间" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="leaveDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitLeaveApply">提交</el-button>
        </template>
      </el-dialog>
    </transition>

    <!-- 异动记录弹窗 -->
    <transition name="zoom-fade">
      <el-dialog
        title="新增异动记录"
        :visible.sync="changeDialog.visible"
        width="500px"
        :modal-append-to-body="false"
      >
        <el-form :model="changeDialog.form" label-width="150px">
          <el-form-item label="异动类型">
            <el-select v-model="changeDialog.form.type" placeholder="请选择类型">
              <el-option :value="1" label="部门调整" />
              <el-option :value="2" label="岗位调整" />
              <el-option :value="3" label="晋升" />
              <el-option :value="4" label="降职" />
              <el-option :value="5" label="转正" />
            </el-select>
          </el-form-item>
          <el-form-item label="计划完成异动时间">
            <el-date-picker v-model="changeDialog.form.planChangeTime" type="datetime" placeholder="选择时间" />
          </el-form-item>
          <el-form-item label="计划离开原部门时间">
            <el-date-picker v-model="changeDialog.form.planLeaveTime" type="datetime" placeholder="可为空" />
          </el-form-item>
          <el-form-item label="新部门">
            <el-popover placement="bottom-start" width="300" trigger="click" v-model="deptSelect.newVisible">
              <el-tree
                :data="deptTree"
                :props="deptTreeProps"
                highlight-current
                node-key="id"
                default-expand-all
                @node-click="(node) => selectDepartment('new', node)"
              />
              <el-input slot="reference" v-model="deptSelect.newName" placeholder="请选择新部门" readonly />
            </el-popover>
          </el-form-item>
          <el-form-item label="原部门">
            <el-popover placement="bottom-start" width="300" trigger="click" v-model="deptSelect.oldVisible">
              <el-tree
                :data="deptTree"
                :props="deptTreeProps"
                highlight-current
                node-key="id"
                default-expand-all
                @node-click="(node) => selectDepartment('old', node)"
              />
              <el-input slot="reference" v-model="deptSelect.oldName" placeholder="请选择原部门" readonly />
            </el-popover>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="changeDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitChangeRecord">提交</el-button>
        </template>
      </el-dialog>
    </transition>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'AppUserInfoTab',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      search: {
        name: '',
        id: '',
        status: null,
        type: null,
        school: ''
      },
      pageRequest: {
        pageNo: 1,
        pageSize: 10
      },
      typeMap: {
        0: '开发者',
        1: '普通成员',
        2: '干部',
        3: '管理员'
      },
      leaveDialog: {
        visible: false,
        form: {
          userId: null,
          reason: '',
          planLeaveTime: ''
        }
      },
      changeDialog: {
        visible: false,
        form: {
          userId: null,
          type: null,
          status: 1,
          planChangeTime: '',
          planLeaveTime: '',
          newDepartmentId: null,
          oldDepartmentId: null
        }
      },
      deptTree: [],
      deptTreeProps: { children: 'children', label: 'name', value: 'id' },
      deptSelect: {
        newVisible: false,
        oldVisible: false,
        newName: '',
        oldName: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      axios.post('/user/pageUserInfo', {
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
        id: '',
        status: null,
        type: null,
        school: ''
      }
      this.pageRequest.pageNo = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageRequest.pageNo = page
      this.fetchData()
    },
    openLeaveDialog(user) {
      this.leaveDialog.form = {
        userId: user.id,
        reason: '',
        planLeaveTime: ''
      }
      this.leaveDialog.visible = true
    },
    submitLeaveApply() {
      axios.post('/leave/addLeaveApply', this.leaveDialog.form).then(() => {
        this.$message.success('离社申请提交成功')
        this.leaveDialog.visible = false
      })
    },
    openChangeDialog(user) {
      this.changeDialog.form = {
        userId: user.id,
        type: null,
        status: 1,
        planChangeTime: '',
        planLeaveTime: '',
        newDepartmentId: null,
        oldDepartmentId: null
      }
      this.deptSelect = {
        newVisible: false,
        oldVisible: false,
        newName: '',
        oldName: ''
      }
      this.changeDialog.visible = true
      this.loadDeptTree()
    },
    async loadDeptTree() {
      const res = await axios.post('/department/listDepartmentTree')
      this.deptTree = res || []
    },
    selectDepartment(type, node) {
      if (type === 'new') {
        this.changeDialog.form.newDepartmentId = node.id
        this.deptSelect.newName = node.name
        this.deptSelect.newVisible = false
      } else if (type === 'old') {
        this.changeDialog.form.oldDepartmentId = node.id
        this.deptSelect.oldName = node.name
        this.deptSelect.oldVisible = false
      }
    },
    submitChangeRecord() {
      axios.post('/change/addChangeRecord', this.changeDialog.form).then(() => {
        this.$message.success('异动记录提交成功')
        this.changeDialog.visible = false
      })
    }
  }
}
</script>

<style scoped>
.app-user-info-tab {
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

/* 按钮动效 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.action-button {
  display: inline-block;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 弹窗动效 */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: all 0.3s ease;
}
.zoom-fade-enter, .zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
</style>
