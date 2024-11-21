/**
 * TODO: 后端接口
 * 1. 获取联系人列表
 * GET /api/contacts
 * Response: { contacts: Contact[] }
 * 
 * 2. 搜索联系人
 * GET /api/contacts/search?keyword={keyword}
 * Response: { contacts: Contact[] }
 * 
 * 3. 添加联系人
 * POST /api/contacts/{userId}
 * Response: { success: boolean }
 */
<template>
  <div class="contacts-panel">
    <div class="search-bar">
      <el-input
        v-model="searchText"
        :placeholder="t('chat.searchContacts')"
        :prefix-icon="Search"
        clearable
      />
    </div>

    <div class="contacts-content scrollable">
      <!-- 创建群聊 -->
      <create-group />

      <!-- 新朋友 -->
      <new-friends />

      <!-- 联系人列表 -->
      <div class="contacts-section">
        <div class="section-header">
          <h3>{{ t('chat.contacts') }}</h3>
          <span class="contact-count">{{ filteredContacts.length }}</span>
        </div>
        <div class="contact-list">
          <div
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="contact-item"
            @click="selectContact(contact)"
          >
            <el-avatar :size="40" :src="contact.avatar">
              {{ contact.name.charAt(0) }}
            </el-avatar>
            <div class="contact-info">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-status" :class="contact.status">
                {{ t(`profile.${contact.status}`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import CreateGroup from './CreateGroup.vue'
import NewFriends from './NewFriends.vue'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'select-contact', contact: any): void
}>()

const searchText = ref('')

const contacts = [
  {
    id: 1,
    name: '田中',
    avatar: '',
    status: 'online',
    type: 'private',
    lastMessage: '',
    lastTime: ''
  },
  {
    id: 2,
    name: '佐藤',
    avatar: '',
    status: 'online',
    type: 'private',
    lastMessage: '',
    lastTime: ''
  }
]

const filteredContacts = computed(() => {
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const selectContact = (contact: any) => {
  const chatItem = {
    id: contact.id,
    name: contact.name,
    type: 'private',
    avatar: contact.avatar,
    lastMessage: contact.lastMessage || '',
    lastTime: contact.lastTime || '',
    unread: 0
  }
  emit('select-contact', chatItem)
}
</script>

<style scoped>
.contacts-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 10px;
  flex-shrink: 0;
}

.contacts-content {
  flex: 1;
  overflow-y: auto;
}

.contacts-section {
  padding: 10px;
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

.contact-count {
  font-size: 12px;
  color: #909399;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-info {
  margin-left: 10px;
}

.contact-name {
  font-weight: 500;
}

.contact-status {
  font-size: 12px;
  color: #909399;
}

.contact-status.online {
  color: #67c23a;
}
</style> 