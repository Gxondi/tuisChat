/**
 * TODO: 后端接口
 * 1. 获取在线用户
 * GET /api/users/online
 * Response: { users: OnlineUser[] }
 * 
 * 2. 获取用户状态
 * GET /api/users/{userId}/status
 * Response: { status: string }
 * 
 * 3. WebSocket事件
 * - user_online: 用户上线
 * - user_offline: 用户下线
 * - user_status: 用户状态变更
 */
<template>
  <div class="online-users">
    <div class="header">
      <h3>{{ t('chat.onlineUsers') }} ({{ onlineCount }})</h3>
    </div>
    <div class="users-list scrollable">
      <transition-group name="list">
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="user-item hover-scale"
          :class="{ 'offline': !user.isOnline }"
        >
          <div class="user-avatar" :class="{ 'offline': !user.isOnline }">
            <el-avatar :size="36" :src="user.avatar">
              {{ user.name.charAt(0) }}
            </el-avatar>
            <div class="status-dot" :class="{ 'online': user.isOnline }"></div>
          </div>
          <div class="user-info">
            <div class="user-name" :class="{ 'offline': !user.isOnline }">
              {{ user.name }}
            </div>
            <div class="user-status" :class="user.isOnline ? 'online' : 'offline'">
              {{ user.isOnline ? t('profile.online') : t('profile.offline') }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface User {
  id: number
  name: string
  avatar: string
  isOnline: boolean
}

const props = defineProps<{
  users: User[]
}>()

const onlineCount = computed(() => {
  return props.users.filter(user => user.isOnline).length
})
</script>

<style scoped>
.online-users {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e6e6e6;
}

.header {
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.header h3 {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.users-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  transition: all 0.3s;
  position: relative;
}

.user-item:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  position: relative;
}

.user-avatar.offline {
  opacity: 0.6;
  filter: grayscale(100%);
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #909399;
}

.status-dot.online {
  background-color: #67c23a;
}

.user-info {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name.offline {
  color: #909399;
}

.user-status {
  font-size: 12px;
  line-height: 1;
}

.user-status.online {
  color: #67c23a;
}

.user-status.offline {
  color: #909399;
}

/* 添加过渡动画 */
.user-avatar, .user-name, .user-status {
  transition: all 0.3s ease;
}

/* 添加列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 优化在线状态切换动画 */
.user-item {
  position: relative;
  transition: all 0.3s ease;
}

.user-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: opacity 0.3s;
  background: linear-gradient(45deg, #f0f0f0, transparent);
  opacity: 0;
}

.user-item:hover::before {
  opacity: 1;
}

.offline {
  transform: scale(0.98);
}
</style> 