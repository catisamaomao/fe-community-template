<template>
    <div class="profile-container">
      <el-form :model="form" :rules="rules" ref="profileForm" label-width="120px">
        <h2 class="title">个人信息修改</h2>
  
        <!-- 头像上传 -->
        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            action="/user/uploadAvatar" 
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
  
        <!-- 基本信息 -->
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
          <el-input 
            v-model="form.motto"
            type="textarea"
            :autosize="{ minRows: 2 }"
          />
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import service from '@/utils/axios'
  
  export default {
    name: 'UserProfile',
    data() {
      return {
        form: {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('name'),
          email:localStorage.getItem('email'),
          avatarUrl: localStorage.getItem('avatarUrl'),
          studentNum: localStorage.getItem('studentNum'),
          school: localStorage.getItem('school'),
          love: localStorage.getItem('love'),
          motto: localStorage.getItem('motto')
        },
        rules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 16, message: '长度2-16个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
          ],
          studentNum: [
            { pattern: /^\d{12}$/, message: '学号应为12位数字', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.fetchUserInfo()
    },
    methods: {
      // 获取用户信息
      async fetchUserInfo() {
        try {
          const userId = localStorage.getItem('userId')
          const res = service.post('/user/getUserInfo', {
            userId: parseInt(userId)
          } ) 
          if (res.success) {
            const res = await service.post('/user/getUserInfo', {
          userId: parseInt(userId)  // 👈 确保是数字
        })
            this.form = { 
              ...res.data,
              // 过滤不需要的字段
              password: undefined 
            }
          }
        } catch (err) {
          this.$message.error(err.errorCode?.message || '获取信息失败1')
        }
      },
  
      // 头像上传成功
      handleAvatarSuccess(res) {
        if (res.success) {
          this.form.avatarUrl = res.data // 根据实际返回结构调整
          this.$message.success('头像更新成功')
        }
      },
  
      // 头像上传校验
      beforeAvatarUpload(file) {
        const isImage = file.type.startsWith('image/')
        const isLt5M = file.size / 1024 / 1024 < 5
        
        if (!isImage) this.$message.error('请上传图片文件')
        if (!isLt5M) this.$message.error('图片大小不能超过5MB')
        return isImage && isLt5M
      },
  
      // 提交修改
      async submitForm() {
        this.$refs.profileForm.validate(async valid => {
          const userId = localStorage.getItem('userId')
          if (!valid) return
  
          try {
            const payload = {
              ...this.form,
              id: parseInt(userId)  // 根据接口是否需要ID决定是否保留
            }
            
            await service.post('/user/updateUserInfo', payload)
            this.$message.success('修改成功')
          } catch (err) {
            this.$message.error(err.message || '请求异常')
          }
        })
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
    color: #303133;
    font-size: 24px;
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
  
  .avatar-uploader {
    display: block;
    width: 150px;
    height: 150px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
  }
  
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  
  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .el-form-item {
    margin-bottom: 22px;
  }
  
  .el-form-item:last-child {
    margin-bottom: 0;
    text-align: right;
  }
  
  .el-button + .el-button {
    margin-left: 15px;
  }
  
  /* 响应式设计 */
  @media (max-width: 992px) {
    .profile-container {
      margin: 20px;
      padding: 20px;
    }
  }
  
  @media (max-width: 768px) {
    .profile-container {
      margin: 10px;
      padding: 15px;
    }
  
    .title {
      font-size: 20px;
      margin-bottom: 20px;
    }
  
    .avatar-uploader {
      width: 120px;
      height: 120px;
    }
  
    .avatar-uploader-icon {
      width: 120px;
      height: 120px;
      line-height: 120px;
    }
  
    .el-form-item__label {
      text-align: left !important;
      padding-right: 10px;
    }
  }
  
  @media (max-width: 480px) {
    .el-form-item:last-child {
      text-align: center;
    }
    
    .el-button {
      width: 100%;
      margin: 5px 0;
    }
  
    .el-button + .el-button {
      margin-left: 0;
    }
  }
  </style>