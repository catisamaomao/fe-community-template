<template>
  <div class="profile-container">
    <el-form :model="form" :rules="rules" ref="profileForm" label-width="120px">
      <h2 class="title">个人信息修改</h2>

      <!-- 头像上传 + 裁剪 -->
      <el-form-item label="头像" prop="avatarUrl">
        <div class="avatar-wrapper">
          <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
          <div v-else class="avatar-placeholder">暂无头像</div>
          <el-button type="primary" size="mini" @click="showCropper = true">
            {{ form.avatarUrl ? '重新上传' : '上传头像' }}
          </el-button>
        </div>
      </el-form-item>

      <!-- 基本信息表单略 -->
      <el-form-item label="用户名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="学号" prop="studentNum">
        <el-input v-model="form.studentNum" />
      </el-form-item>
      <el-form-item label="学校" prop="school">
        <el-input v-model="form.school" />
      </el-form-item>
      <el-form-item label="爱好" prop="love">
        <el-input v-model="form.love" />
      </el-form-item>
      <el-form-item label="座右铭" prop="motto">
        <el-input v-model="form.motto" type="textarea" :autosize="{ minRows: 2 }" />
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.password" show-password placeholder="不填则不修改密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存修改</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>

    <!-- 裁剪弹窗 -->
    <el-dialog title="裁剪头像" :visible.sync="showCropper" width="600px">
      <vue-cropper
        ref="cropper"
        :img="cropImageUrl"
        :output-size="1"
        :output-type="'jpeg'"
        :info="true"
        :can-move="true"
        :auto-crop="true"
        :fixed-box="true"
        :fixed="true"
        :center-box="true"
        :circle="true"
        style="height: 400px"
      />
      <div style="margin-top: 10px; text-align: right">
        <el-upload
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :http-request="() => {}"
        >
          <el-button>选择图片</el-button>
        </el-upload>
        <el-button type="primary" @click="cropAndUpload">上传</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/axios'
import { VueCropper } from 'vue-cropper'

export default {
  name: 'UserProfile',
  components: { VueCropper },
  data() {
    return {
      form: {
        id: localStorage.getItem('userId'),
        name: '', email: '', studentNum: '', school: '', love: '', motto: '', password: '', avatarUrl: ''
      },
      rules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确' }],
        studentNum: [{ pattern: /^\d{12}$/, message: '学号应为12位数字', trigger: 'blur' }],
        password: [{ min: 6, message: '密码至少6位', trigger: 'blur' }]
      },
      showCropper: false,
      cropImageUrl: '',
      rawImage: null
    }
  },
  created() {
    this.fetchUserInfo()
  },
  methods: {
    async fetchUserInfo() {
      const res = await service.post('/user/getUserInfo', { userId: parseInt(this.form.id) })
      if (res.success) this.form = { ...res.data, password: '' }
    },
    handleBeforeUpload(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.cropImageUrl = e.target.result
        this.rawImage = file
      }
      reader.readAsDataURL(file)
      return false
    },
    cropAndUpload() {
      this.$refs.cropper.getCropBlob(async (blob) => {
        const formData = new FormData()
        formData.append('file', blob, 'avatar.jpg')

        try {
          const res = await service.post(`${process.env.VUE_APP_API_BASE}/file/uploadAvatar`, formData)
          if (res.success) {
            this.form.avatarUrl = res.data
            await service.post('/user/updateUserInfo', {
              id: parseInt(this.form.id),
              avatarUrl: res.data
            })
            this.$message.success('头像已上传')
            this.showCropper = false
          } else {
            this.$message.error(res.message || '上传失败')
          }
        } catch (e) {
          this.$message.error('上传异常')
        }
      })
    },
    async submitForm() {
      const valid = await this.$refs.profileForm.validate()
      if (!valid) return
      const payload = { ...this.form, id: parseInt(this.form.id) }
      if (!payload.password) delete payload.password
      await service.post('/user/updateUserInfo', payload)
      this.$message.success('修改成功')
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #303133;
  position: relative;
  padding-bottom: 10px;
}
.title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #409EFF;
}
.avatar-wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}
.avatar-placeholder {
  width: 150px;
  height: 150px;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  margin-bottom: 8px;
}
</style>
