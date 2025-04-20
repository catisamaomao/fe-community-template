<template>
  <div class="app-department-manager">
    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col :span="6">
        <el-input v-model="filterText" placeholder="搜索部门" clearable style="margin-bottom: 10px;" />
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          highlight-current
          default-expand-all
          node-key="id"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          style="height: 500px; overflow: auto"
        />
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="18">
        <el-card>
          <div class="header">
            <div class="info">
              <h2>{{ currentDept?.name || '请选择左侧部门喵～' }}</h2>
              <p><i class="el-icon-user" /> 负责人：{{ currentDept?.leaderName || '-' }}</p>
              <p><i class="el-icon-s-check" /> 部门状态：{{ formatStatus(currentDept?.status) }}</p>
              <p><i class="el-icon-document" /> 备注：{{ currentDept?.remark || '-' }}</p>
            </div>
            <div class="actions">
              <el-button type="primary" size="mini" @click="openAddDialog">➕ 新增部门</el-button>
              <el-button type="warning" size="mini" :disabled="!currentDept" @click="openEditDialog">✏️ 修改部门</el-button>
            </div>
          </div>

          <el-divider content-position="left">下级部门列表</el-divider>
          <el-table :data="childDepartments" v-loading="loading.child">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="部门名称" />
            <el-table-column prop="level" label="层级" />
            <el-table-column label="状态" :formatter="formatStatus" />
          </el-table>

          <el-divider content-position="left">部门成员列表</el-divider>
          <el-table :data="memberList" v-loading="loading.member">
            <el-table-column prop="name" label="姓名" />
            <el-table-column label="类型" :formatter="formatType" />
            <el-table-column label="年级" :formatter="formatStudentLevel" />
            <el-table-column prop="studentNum" label="学号" />
            <el-table-column prop="school" label="学校" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="所属部门">
              <template #default="scope">
                <div>
                  {{ scope.row.mainDepartmentName }}
                  <span v-if="getExtraDepartments(scope.row).length" style="color: #999">
                    （兼任：{{ getExtraDepartments(scope.row).join('、') }}）
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗：新增/修改 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="负责人ID">
          <el-input v-model="form.leaderUserId" />
        </el-form-item>
        <el-form-item label="部门状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级部门">
          <el-popover
            ref="popover"
            placement="bottom-start"
            width="300"
            trigger="click"
            v-model="treePopoverVisible"
          >
            <el-tree
              :data="treeData"
              :props="defaultProps"
              highlight-current
              node-key="id"
              default-expand-all
              @node-click="selectParent"
              :render-content="renderTreeNode"
            />
            <el-input
              slot="reference"
              v-model="selectedParentName"
              placeholder="请选择上级部门"
              readonly
            />
          </el-popover>
        </el-form-item>
        <el-form-item label="部门描述">
          <el-input v-model="form.remark" type="textarea" rows="3" />
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
  name: 'AppDepartmentManager',
  data() {
    return {
      filterText: '',
      treeData: [],
      currentDept: null,
      leaderName: '',
      childDepartments: [],
      memberList: [],
      loading: { child: false, member: false },
      dialogVisible: false,
      isEdit: false,
      treePopoverVisible: false,
      form: {
        id: null,
        name: '',
        leaderUserId: null,
        parentId: null,
        status: 1,
        remark: ''
      },
      selectedParentName: '',
      rules: {
        name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      },
      defaultProps: { children: 'children', label: 'name', value: 'id' }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '修改部门' : '新增部门'
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeRef.filter(val)
    }
  },
  mounted() {
    this.loadDepartmentTree()
  },
  methods: {
    filterNode(value, data) {
      return !value || data.name.includes(value)
    },
    formatStatus(val) {
      if (val != null) {
        if (typeof val === 'object' && 'status' in val) {
          return val.status === 1 ? '启用' : '禁用'
        }
        return val === 1 ? '启用' : '禁用'
      }
      return '-'
    },
    formatType(row) {
      const map = { 0: '开发者', 1: '普通成员', 2: '干部', 3: '管理员' }
      return map[row.type] || '-'
    },
    formatStudentLevel(row) {
      const map = { 1: '大一', 2: '大二', 3: '大三', 4: '大四', 5: '已毕业' }
      return map[row.studentLevel] || '-'
    },
    getExtraDepartments(row) {
      if (!row.departmentNames || !row.mainDepartmentName) return []
      return row.departmentNames.split('-').filter(name => name && name !== row.mainDepartmentName)
    },
    async loadDepartmentTree() {
      const res = await axios.post('/department/listDepartmentTree')
      this.treeData = res || []
    },
    async handleNodeClick(dept) {
      this.currentDept = this.findDeptById(dept.id) || dept
      const req = { id: dept.id }
      this.loading.child = true
      this.loading.member = true
      try {
        const [childRes, memberRes] = await Promise.all([
          axios.post('/department/listSubDepartment', req),
          axios.post('/department/listDepartmentMember', req)
        ])
        this.childDepartments = childRes || []
        this.memberList = memberRes || []
        if (dept.leaderUserId) {
          const userInfoRes = await axios.post('/getUserInfo', { userId: dept.leaderUserId })
          this.currentDept.leaderName = userInfoRes?.name || ''
        }
      } finally {
        this.loading.child = false
        this.loading.member = false
      }
    },
    findDeptById(id) {
      const find = (list) => {
        for (const item of list) {
          if (item.id === id) return item
          if (item.children) {
            const found = find(item.children)
            if (found) return found
          }
        }
        return null
      }
      return find(this.treeData)
    },
    openAddDialog() {
      this.isEdit = false
      this.dialogVisible = true
      this.form = {
        name: '',
        leaderUserId: null,
        status: 1,
        parentId: this.currentDept?.id || null,
        remark: ''
      }
      this.selectedParentName = this.currentDept?.name || ''
    },
    openEditDialog() {
      if (!this.currentDept) return
      this.isEdit = true
      this.dialogVisible = true
      Object.assign(this.form, {
        id: this.currentDept.id,
        name: this.currentDept.name,
        leaderUserId: this.currentDept.leaderUserId,
        parentId: this.currentDept.parentId,
        status: this.currentDept.status,
        remark: this.currentDept.remark
      })
      this.selectedParentName = this.findDeptNameById(this.form.parentId)
    },
    findDeptNameById(id) {
      const find = (nodes) => {
        for (const node of nodes) {
          if (node.id === id) return node.name
          if (node.children) {
            const found = find(node.children)
            if (found) return found
          }
        }
        return ''
      }
      return find(this.treeData)
    },
    selectParent(node) {
      if (this.isEdit && node.id === this.form.id) {
        this.$message.warning('不能选择自己作为上级部门喵～')
        return
      }
      this.form.parentId = node.id
      this.selectedParentName = node.name
      this.treePopoverVisible = false
    },
    renderTreeNode(h, { node, data }) {
      return h('span', {}, [
        h('span', node.label),
        data.remark
          ? h('span', { style: 'color: #999; margin-left: 6px; fontSize: 12px' }, `（${data.remark}）`)
          : null
      ])
    },
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        try {
          const url = this.isEdit ? '/department/updateDepartment' : '/department/addDepartment'
          await axios.post(url, this.form)
          this.$message.success(this.isEdit ? '修改成功！' : '新增成功！')
          this.dialogVisible = false
          await this.loadDepartmentTree()
          if (this.currentDept) {
            await this.handleNodeClick(this.currentDept)
          }
        } catch (e) {
          this.$message.error(e.message || '操作失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.app-department-manager {
  padding: 20px;
}
.header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}
.header .info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}
</style>
