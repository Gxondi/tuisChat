<template>
  <div class="chat-toolbar">
    <div class="toolbar-buttons">
      <el-popover
        v-model:visible="showEmoji"
        :width="300"
        trigger="manual"
        placement="top-start"
        popper-class="emoji-popover"
      >
        <template #reference>
          <div class="toolbar-item">
            <el-tooltip :content="t('chat.emoji')" placement="top">
              <el-icon @click="toggleEmoji"><ChatRound /></el-icon>
            </el-tooltip>
          </div>
        </template>
        
        <div class="emoji-picker">
          <div class="emoji-categories">
            <div
              v-for="(category, index) in emojiCategories"
              :key="index"
              class="category-item"
              :class="{ active: currentCategory === index }"
              @click.stop="currentCategory = index"
            >
              {{ category.icon }}
            </div>
          </div>
          <div class="emoji-list">
            <div
              v-for="emoji in currentEmojis"
              :key="emoji"
              class="emoji-item"
              @click.stop="selectEmoji(emoji)"
            >
              {{ emoji }}
            </div>
          </div>
        </div>
      </el-popover>

      <el-tooltip :content="t('chat.sendImage')" placement="top">
        <div class="toolbar-item">
          <el-upload
            class="upload-trigger"
            action="#"
            :show-file-list="false"
            :before-upload="handleImageSelect"
            accept="image/*"
          >
            <el-icon><PictureRounded /></el-icon>
          </el-upload>
        </div>
      </el-tooltip>

      <el-tooltip :content="t('chat.sendFile')" placement="top">
        <div class="toolbar-item">
          <el-upload
            class="upload-trigger"
            action="#"
            :show-file-list="false"
            :before-upload="handleFileSelect"
          >
            <el-icon><Folder /></el-icon>
          </el-upload>
        </div>
      </el-tooltip>

      <el-popover
        v-model:visible="showUserList"
        :width="200"
        trigger="click"
        placement="top-start"
        popper-class="mention-popover"
      >
        <template #reference>
          <div class="toolbar-item">
            <el-tooltip :content="t('chat.mentionUser')" placement="top">
              <el-icon @click="toggleMention"><User /></el-icon>
            </el-tooltip>
          </div>
        </template>
        
        <div class="mention-users">
          <div
            v-for="user in users"
            :key="user.id"
            class="mention-user-item"
            @click="handleMention(user)"
          >
            <el-avatar :size="24" :src="user.avatar">
              {{ user.name.charAt(0) }}
            </el-avatar>
            <span>{{ user.name }}</span>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatRound, PictureRounded, Folder, User } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'select-emoji', emoji: string): void
  (e: 'select-image', file: File): void
  (e: 'select-file', file: File): void
  (e: 'mention-user', username: string): void
}>()

const showEmoji = ref(false)
const showUserList = ref(false)
const currentCategory = ref(0)

const users = [
  { id: 1, name: '张三', avatar: '' },
  { id: 2, name: '李四', avatar: '' },
  { id: 3, name: '王五', avatar: '' }
]

const emojiCategories = [
  { icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'] },
  { icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤'] },
  { icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'] },
  { icon: '🍎', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓'] }
]

const currentEmojis = computed(() => {
  return emojiCategories[currentCategory.value].emojis
})

const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value
  if (showEmoji.value) {
    showUserList.value = false
  }
}

const toggleMention = () => {
  showUserList.value = !showUserList.value
  if (showUserList.value) {
    showEmoji.value = false
  }
}

const selectEmoji = (emoji: string) => {
  emit('select-emoji', emoji)
}

const handleMention = (user: { name: string }) => {
  emit('mention-user', user.name)
  showUserList.value = false
}

const handleImageSelect = (file: File) => {
  emit('select-image', file)
  return false
}

const handleFileSelect = (file: File) => {
  emit('select-file', file)
  return false
}
</script>

<style scoped>
.emoji-popover {
  padding: 0 !important;
  z-index: 2000 !important;
}

.mention-popover {
  padding: 0 !important;
}

.chat-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #e6e6e6;
  position: relative;
  background-color: #fff;
  z-index: 100;
}

.toolbar-buttons {
  display: flex;
  gap: 16px;
}

.toolbar-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
}

.toolbar-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.upload-trigger {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-picker {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
  user-select: none;
}

.emoji-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 8px;
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.category-item {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  flex: 0 0 auto;
}

.category-item.active {
  background-color: #f0f0f0;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 4px;
}

.emoji-item {
  font-size: 24px;
  padding: 4px;
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

.mention-users {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
}

.mention-user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.mention-user-item:hover {
  background-color: #f5f7fa;
}

.toolbar-buttons {
  margin-left: 10px;
}
</style> 