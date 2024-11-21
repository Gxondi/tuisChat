/** * TODO: 后端接口 * 1. 获取用户资料 * GET /api/users/{userId}/profile *
Response: { user: User } * * 2. 更新用户资料 * PUT /api/users/{userId}/profile *
Body: { name?, avatar?, status? } * Response: { user: User } * * 3. 上传头像 *
POST /api/users/avatar * FormData: { avatar } * Response: { url: string } * * 4.
获取用户徽章 * GET /api/users/{userId}/badges * Response: { badges: Badge[] } */
<template>
  <div class="user-profile">
    <div class="profile-avatar" @click="showProfileDialog = true">
      <el-avatar :size="50" :src="userProfile.avatar">
        {{ userProfile.name.charAt(0) }}
      </el-avatar>
      <div class="online-status" :class="userProfile.status"></div>
    </div>
    <div class="profile-name">
      {{ userProfile.name }}
    </div>
  </div>

  <!-- 个人资料对话框 -->
  <el-dialog v-model="showProfileDialog" :title="t('profile.title')" width="500px" class="profile-dialog"
    :close-on-click-modal="false">
    <div class="profile-content">
      <!-- 头像上传 -->
      <div class="avatar-section">
        <el-upload class="avatar-uploader" action="#" :show-file-list="false" :before-upload="handleAvatarUpload">
          <img v-if="userProfile.avatar" :src="userProfile.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </div>
      <!-- 状态 -->
      <el-form :model="editForm" label-width="100px">
        <div class="edit-container">
          <div v-if="!isEditing" >
            <span>{{ editForm.name }}</span>
            <el-button type="text" icon="el-icon-edit" @click="isEditing = true"><el-icon><Edit /></el-icon></el-button>
          </div>
          <div v-else>
            <el-input v-model="editForm.name" />
            <el-button type="text" @click="">
              <el-icon><Check /></el-icon>
            </el-button>
            <el-button type="text" @click="">
              <el-icon><Close /></el-icon>              
            </el-button>
          </div>
        </div>
      </el-form>
      <!-- badges-section -->
      <div class="badges-section">
    <div class="badges-grid">
      <user-badge v-for="badge in availableBadges" :key="badge.name" :badge="badge"
        :disabled="!userProfile.badges.some((b) => b.name === badge.name)">
        <template #description>
          <div v-if="!userProfile.badges.some((b) => b.name === badge.name)" class="badge-locked">
            {{ t("profile.badgeLocked") }}
          </div>
        </template>
        <template #default>
          <div class="badge-icon">
            <el-icon :name="badge.icon" />
          </div>
        </template>
      </user-badge>
    </div>
  </div>
     
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showProfileDialog = false">{{
          t("common.close")
        }}</el-button>
        <el-button type="primary" @click="saveProfile">{{
          t("common.save")
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Edit, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import UserBadge from "./UserBadge.vue";

const { t } = useI18n();
const showProfileDialog = ref(false);
const isEditing = ref(false);
// 所有可用的徽章列表
const availableBadges = [
  {
    name: t("badges.founder"),
    description: t("badges.founderDesc"),
    icon: "Medal",
    isSpecial: true,
  },
  {
    name: t("badges.popular"),
    description: t("badges.popularDesc"),
    icon: "Star",
    isSpecial: true,
  },
  {
    name: t("badges.active"),
    description: t("badges.activeDesc"),
    icon: "Calendar",
    isSpecial: false,
  },
  {
    name: t("badges.social"),
    description: t("badges.socialDesc"),
    icon: "ChatDotRound",
    isSpecial: false,
  },
];

const userProfile = reactive({
  name: "田中",
  avatar: "",
  status: "online",
  badges: [
    {
      name: t("badges.founder"),
      description: t("badges.founderDesc"),
      icon: "Medal",
      isSpecial: true,
    },
  ],
  messageCount: 128,
  likesReceived: 56,
  daysActive: 15,
});

const editForm = reactive({
  name: userProfile.name,
  status: userProfile.status,
  avatar: userProfile.avatar,
});

const handleAvatarUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    userProfile.avatar = e.target?.result as string;
    editForm.avatar = userProfile.avatar;
  };
  reader.readAsDataURL(file);
  return false;
};

const saveProfile = () => {
  Object.assign(userProfile, editForm);
  showProfileDialog.value = false;
  ElMessage.success(t("profile.updateSuccess"));
};
</script>

<style scoped>
.edit-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}

.user-profile {
  padding: 10px;
  text-align: center;
  width: 80px;
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
}

.badges-section {
  margin-top: 20px;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 12px;
}

.badge-locked {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.achievements-section {
  margin-top: 20px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.achievement-item {
  text-align: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.achievement-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.achievement-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.profile-dialog :deep(.el-dialog__body) {
  padding-top: 30px;
}
</style>
