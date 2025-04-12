<template>
  <div>
    <AppAnnouncementUser v-if="userType === '1'" />
    <AppAnnouncementAdmin v-else />
  </div>
</template>

<script>
import AppAnnouncementUser from './AppAnnouncementUser.vue'
import AppAnnouncementAdmin from './AppAnnouncementAdmin.vue'

export default {
  components: {
    AppAnnouncementUser,
    AppAnnouncementAdmin
  },
  computed: {
    userType() {
      const type = localStorage.getItem('type') || '1'
      console.log('当前用户类型:', type)
      return type
    }
  }
}
</script>
