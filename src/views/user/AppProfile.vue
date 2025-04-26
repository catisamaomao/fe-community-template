<template>
  <div class="profile-container">
    <el-form :model="form" :rules="rules" ref="profileForm" label-width="120px">
      <h2 class="title">个人信息修改</h2>

      <el-form-item label="头像" prop="avatarUrl">
        <div class="avatar-wrapper">
          <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
          <div v-else class="avatar-placeholder">暂无头像</div>
          <el-button type="primary" size="mini" @click="showCropper = true">
            {{ form.avatarUrl ? '重新上传' : '上传头像' }}
          </el-button>
        </div>
      </el-form-item>

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
        output-type="jpeg"
        :auto-crop="true"
        :fixed-box="true"
        :fixed="true"
        :circle="true"
        style="height: 400px; background: #fff; border-radius: 8px; box-shadow: 0 0 8px rgba(0,0,0,0.1);"
      />
      <div class="cropper-footer">
        <el-upload
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :http-request="() => {}"
        >
          <el-button>选择图片</el-button>
        </el-upload>
        <el-progress v-if="uploadProgress > 0" :percentage="uploadProgress" :stroke-width="6" style="margin-top: 10px;" />
        <el-button type="primary" :loading="uploading" @click="cropAndUpload" style="margin-top: 10px;">
          {{ uploading ? '上传中...' : '上传' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/axios'
import { VueCropper } from 'vue-cropper'

export default {
  name: 'AppProfile',
  components: { VueCropper },
  data() {
    return {
      form: {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        studentNum: localStorage.getItem('studentNum') || '',
        school: localStorage.getItem('school') || '',
        love: localStorage.getItem('love') || '',
        motto: localStorage.getItem('motto') || '',
        avatarUrl: localStorage.getItem('avatarUrl') || '',
        password: ''
      },
      rules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        studentNum: [{ pattern: /^\d{12}$/, message: '学号应为12位数字', trigger: 'blur' }],
        password: [{ min: 6, message: '密码至少6位', trigger: 'blur' }]
      },
      showCropper: false,
      cropImageUrl: '',
      uploading: false,
      uploadProgress: 0
    }
  },
  methods: {
    handleBeforeUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('仅支持 JPG/PNG/GIF 格式')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB')
        return false
      }

      const reader = new FileReader()
      reader.onload = e => { this.cropImageUrl = e.target.result }
      reader.readAsDataURL(file)
      return false
    },
    async cropAndUpload() {
      if (!this.cropImageUrl) {
        this.$message.warning('请先选择图片')
        return
      }
      this.uploading = true
      this.uploadProgress = 0
      this.$refs.cropper.getCropBlob(async blob => {
        const formData = new FormData()
        formData.append('file', blob, 'avatar.jpg')
        formData.append('userId', this.form.id)

        try {
          const url = await service.post('/file/uploadAvatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.lengthComputable) {
                this.uploadProgress = Math.round(progressEvent.loaded * 100 / progressEvent.total)
              }
            }
          })

          this.form.avatarUrl = url
          localStorage.setItem('avatarUrl', url)
          this.$message.success('头像上传成功')
          this.showCropper = false
          setTimeout(() => window.location.reload(), 500) // 延迟半秒刷新
        } catch (e) {
          console.error(e)
          this.$message.error('上传失败')
        } finally {
          this.uploading = false
          this.uploadProgress = 0
        }
      }, 'image/jpeg', 0.7)
    },
    async submitForm() {
      try {
        await this.$refs.profileForm.validate()
        const payload = { ...this.form, id: parseInt(this.form.id) }
        if (!payload.password) delete payload.password
        await service.post('/user/updateUserInfo', payload)
        this.$message.success('信息保存成功')
      } catch (e) {
        console.error(e)
        this.$message.error('保存失败')
      }
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
.cropper-footer {
  margin-top: 10px;
  text-align: right;
}
</style>
