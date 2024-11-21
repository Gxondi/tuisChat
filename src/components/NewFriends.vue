/**
 * TODO: 后端接口
 * 1. 获取好友请求
 * GET /api/contacts/requests
 * Response: { requests: Request[] }
 * 
 * 2. 处理好友请求
 * PUT /api/contacts/requests/{requestId}
 * Body: { action: 'accept' | 'reject' }
 * Response: { success: boolean }
 * 
 * 3. 发送好友请求
 * POST /api/contacts/requests
 * Body: { userId, message }
 * Response: { success: boolean }
 */
<template>
  <div class="new-friends">
    <div class="section-header">
      <h3>{{ t('chat.newFriends') }}</h3>
      <el-badge :value="requests.length" :hidden="!requests.length" type="danger" />
    </div>
    <div class="requests-list scrollable">
      <div v-for="request in requests" :key="request.id" class="request-item">
        <div class="request-main">
          <el-avatar :size="40" :src="request.avatar">
            {{ request.name.charAt(0) }}
          </el-avatar>
          <div class="request-info">
            <div class="request-name">{{ request.name }}</div>
            <div class="request-message" :title="request.message">
              {{ request.message }}
            </div>
          </div>
        </div>
        <div class="request-actions">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleRequest(request.id, true)"
          >
            {{ t('common.accept') }}
          </el-button>
          <el-button 
            size="small" 
            @click="handleRequest(request.id, false)"
          >
            {{ t('common.reject') }}
          </el-button>
        </div>
      </div>
      <div v-if="!requests.length" class="no-requests">
        {{ t('chat.noNewFriends') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const requests = ref([
  {
    id: 1,
    name: '田中さん',
    avatar: '',
    message: '友達になりましょう！長いメッセージの場合は省略されます。'
  }
])

const handleRequest = (id: number, accept: boolean) => {
  // TODO: 处理好友请求
  requests.value = requests.value.filter(req => req.id !== id)
}
</script>

<style scoped>
.new-friends {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.requests-list {
  max-height: 300px;
  overflow-y: auto;
}

.request-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.request-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.request-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.request-info {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
}

.request-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.request-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 限制消息宽度 */
}

.request-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.no-requests {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 14px;
}

/* 添加按钮悬停效果 */
.request-actions :deep(.el-button) {
  transition: transform 0.2s;
}

.request-actions :deep(.el-button:hover) {
  transform: translateY(-1px);
}

/* 添加徽章动画 */
.el-badge :deep(.el-badge__content) {
  animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes badge-pop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* 优化滚动条样式 */
.requests-list::-webkit-scrollbar {
  width: 4px;
}

.requests-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.requests-list::-webkit-scrollbar-track {
  background: transparent;
}
</style> 