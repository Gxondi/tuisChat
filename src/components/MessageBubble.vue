/**
 * TODO: 后端接口
 * 1. 消息反应（点赞/踩）
 * POST /api/messages/{messageId}/reactions
 * Body: { type: 'like' | 'dislike' }
 * Response: { success: boolean }
 * 
 * 2. 翻译消息
 * POST /api/messages/{messageId}/translate
 * Body: { targetLang: 'zh' | 'en' | 'ja' }
 * Response: { translatedText: string }
 * 
 * 3. 获取回复消息
 * GET /api/messages/{messageId}/replies
 * Response: { replies: Reply[] }
 */
<template>
  <div 
    :class="['message', isSelf ? 'message-self' : 'message-other', 'message-animate']"
    :id="`message-${props.id}`"
  >
    <div class="message-content-wrapper">
      <!-- 回复引用部分 -->
      <div v-if="replyTo" class="reply-reference" @click="scrollToMessage(replyTo.id)">
        <div class="reference-content">
          <div class="reference-header">
            <el-icon><Top /></el-icon>
            <span class="reference-sender">{{ replyTo.sender }}</span>
          </div>
          <div class="reference-text">{{ getPreviewContent(replyTo) }}</div>
        </div>
      </div>

      <!-- 消息主体部分 -->
      <div class="message-main">
        <div class="message-user">
          <el-avatar :size="40" :src="avatar">{{ sender.charAt(0) }}</el-avatar>
        </div>
        <div class="message-body">
          <div class="message-info">
            <span class="sender">{{ sender }}</span>
            <span class="time">{{ formatTime }}</span>
          </div>
          <div class="message-content" :class="{ 'is-image': type === 'image', 'is-voice': type === 'voice' }">
            <template v-if="type === 'text'">
              {{ content }}
              <div v-if="translatedContent" class="translated-content">
                <div class="translation-label">{{ currentLanguage }}翻译：</div>
                {{ translatedContent }}
              </div>
            </template>
            <template v-else-if="type === 'image'">
              <el-image
                :src="content"
                :preview-src-list="[content]"
                fit="cover"
                :initial-index="0"
                class="message-image"
              />
            </template>
            <template v-else-if="type === 'file'">
              <div class="file-message">
                <el-icon class="file-icon"><Document /></el-icon>
                <div class="file-info">
                  <div class="file-name">{{ getFileName(content) }}</div>
                  <div class="file-size">{{ getFileSize(content) }}</div>
                </div>
                <el-button type="primary" link @click="downloadFile">下载</el-button>
              </div>
            </template>
            <template v-else-if="type === 'voice'">
              <div class="voice-message" @click="playVoice">
                <el-icon><Microphone /></el-icon>
                <div class="voice-wave" :class="{ 'playing': isPlaying }">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="voice-duration">{{ voiceDuration }}s</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 消息操作栏 -->
      <div class="message-actions" :class="{ 'show': isHovering }">
        <div class="action-buttons">
          <el-button-group size="small">
            <el-button
              :type="isLiked ? 'success' : 'default'"
              @click="toggleLike"
            >
              <el-icon><SuccessFilled /></el-icon>
              <span v-if="likes > 0" class="action-count">{{ likes }}</span>
            </el-button>
            <el-button
              :type="isDisliked ? 'danger' : 'default'"
              @click="toggleDislike"
            >
              <el-icon><CircleCloseFilled /></el-icon>
              <span v-if="dislikes > 0" class="action-count">{{ dislikes }}</span>
            </el-button>
            <el-button @click="showReplyInput = !showReplyInput">
              <el-icon><Promotion /></el-icon>
              <span v-if="replies.length > 0" class="action-count">{{ replies.length }}</span>
            </el-button>
            <el-dropdown @command="handleTranslate" trigger="click">
              <el-button>
                <el-icon><Search /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh">翻译成中文</el-dropdown-item>
                  <el-dropdown-item command="en">翻译成英语</el-dropdown-item>
                  <el-dropdown-item command="ja">翻译成日语</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-button-group>
        </div>
      </div>

      <!-- 回复输入框 -->
      <div v-if="showReplyInput" class="reply-input">
        <el-input
          v-model="replyContent"
          placeholder="输入回复内容..."
          @keyup.enter="handleReply"
        >
          <template #append>
            <el-button @click="handleReply">回复</el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Document, SuccessFilled, CircleCloseFilled, Promotion, Search, Top, Microphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  id: number
  content: string
  sender: string
  timestamp: Date
  type?: 'text' | 'image' | 'file' | 'voice'
  isSelf: boolean
  avatar?: string
  replyTo?: {
    id: number
    sender: string
    content: string
    type?: 'text' | 'image' | 'file'
  }
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'dislike'): void
  (e: 'reply', data: { content: string, replyTo: { id: number, sender: string, content: string, type?: string } }): void
}>()

const isHovering = ref(false)
const showReplyInput = ref(false)
const replyContent = ref('')
const likes = ref(0)
const dislikes = ref(0)
const isLiked = ref(false)
const isDisliked = ref(false)
const translatedContent = ref('')
const currentLanguage = ref('')
const isPlaying = ref(false)
const voiceDuration = ref(0)
let audioElement: HTMLAudioElement | null = null

// 模拟回复数据
const replies = ref<Array<{
  id: number
  sender: string
  content: string
  timestamp: Date
  avatar: string
}>>([])

const formatTime = computed(() => {
  return new Date(props.timestamp).toLocaleTimeString()
})

const formatReplyTime = (time: Date) => {
  return new Date(time).toLocaleTimeString()
}

const toggleLike = () => {
  if (isDisliked.value) {
    isDisliked.value = false
    dislikes.value--
  }
  if (isLiked.value) {
    isLiked.value = false
    likes.value--
  } else {
    isLiked.value = true
    likes.value++
  }
  emit('like')
}

const toggleDislike = () => {
  if (isLiked.value) {
    isLiked.value = false
    likes.value--
  }
  if (isDisliked.value) {
    isDisliked.value = false
    dislikes.value--
  } else {
    isDisliked.value = true
    dislikes.value++
  }
  emit('dislike')
}

const handleReply = () => {
  if (!replyContent.value.trim()) return
  
  emit('reply', {
    content: replyContent.value,
    replyTo: {
      id: props.id,
      sender: props.sender,
      content: props.content,
      type: props.type
    }
  })
  
  replyContent.value = ''
  showReplyInput.value = false
}

const handleTranslate = async (lang: string) => {
  if (props.type !== 'text') return
  
  const languageMap = {
    'zh': '中文',
    'en': '英语',
    'ja': '日语'
  }
  
  ElMessage.success(`正在翻译为${languageMap[lang]}...`)
  
  // 模拟翻译结果
  setTimeout(() => {
    currentLanguage.value = languageMap[lang]
    switch (lang) {
      case 'zh':
        translatedContent.value = '这是翻译后的中文内容'
        break
      case 'en':
        translatedContent.value = 'This is translated English content'
        break
      case 'ja':
        translatedContent.value = 'これは翻訳された日本語のコンテンツです'
        break
    }
  }, 1000)
}

const getFileName = (content: string) => {
  if (props.type !== 'file') return ''
  return content.split('|')[0] || '未知文件'
}

const getFileSize = (content: string) => {
  if (props.type !== 'file') return ''
  return content.split('|')[1] || '未知大小'
}

const downloadFile = () => {
  // 实现文件下载逻辑
}

// 获取预览内容
const getPreviewContent = (message: { content: string, type?: string }) => {
  switch (message.type) {
    case 'image':
      return '[图片]'
    case 'file':
      return '[文件]'
    default:
      return message.content.length > 30 
        ? message.content.substring(0, 30) + '...' 
        : message.content
  }
}

// 滚动到指定消息
const scrollToMessage = (messageId: number) => {
  const element = document.getElementById(`message-${messageId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 添加高亮效果
    element.classList.add('highlight')
    setTimeout(() => {
      element.classList.remove('highlight')
    }, 3000)
  }
}

const playVoice = () => {
  if (!audioElement) {
    audioElement = new Audio(content)
    audioElement.onplay = () => isPlaying.value = true
    audioElement.onpause = () => isPlaying.value = false
    audioElement.onended = () => isPlaying.value = false
  }

  if (isPlaying.value) {
    audioElement.pause()
  } else {
    audioElement.play()
  }
}

onMounted(() => {
  if (props.type === 'voice') {
    const audio = new Audio(props.content)
    audio.onloadedmetadata = () => {
      voiceDuration.value = Math.round(audio.duration)
    }
  }
})

onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
})
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
  padding: 0 20px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content-wrapper {
  max-width: 60%;
}

.message-info {
  margin-bottom: 4px;
  font-size: 12px;
  color: #999;
}

.message-self .message-info {
  text-align: right;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f0f0f0;
  word-break: break-all;
  line-height: 1.4;
  position: relative;
}

.message-self .message-content {
  background-color: #95ec69;
}

.message-content::before {
  content: '';
  position: absolute;
  top: 14px;
  left: -6px;
  width: 12px;
  height: 12px;
  background-color: inherit;
  transform: rotate(45deg);
}

.message-self .message-content::before {
  left: auto;
  right: -6px;
}

.message-content.is-image::before {
  display: none;
}

.message-actions {
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-content-wrapper:hover .message-actions {
  opacity: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.message-self .action-buttons {
  justify-content: flex-end;
}

.action-count {
  margin-left: 4px;
  font-size: 12px;
}

.reply-input {
  margin-top: 8px;
}

.replies-container {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid #e6e6e6;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.reply-content {
  flex: 1;
}

.reply-info {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.reply-sender {
  font-weight: 500;
  margin-right: 8px;
}

.reply-time {
  color: #909399;
}

.reply-text {
  font-size: 14px;
  color: #606266;
}

.translated-content {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.translation-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.is-image {
  padding: 4px;
  background-color: white;
  border: 1px solid #e0e0e0;
}

.message-image {
  max-width: 300px;
  max-height: 400px;
  border-radius: 8px;
  cursor: pointer;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
}

.file-icon {
  font-size: 24px;
  color: #909399;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.sender {
  font-weight: 500;
  margin-right: 8px;
}

.time {
  color: #909399;
}

.reply-reference {
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background-color 0.3s;
  border-left: 3px solid #409eff;
}

.reply-reference:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.reference-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reference-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 12px;
}

.reference-sender {
  font-weight: 500;
}

.reference-text {
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 20px;
}

@keyframes highlight {
  0% { background-color: rgba(64, 158, 255, 0.1); }
  100% { background-color: transparent; }
}

.highlight {
  animation: highlight 3s ease-out;
}

/* 确保消息容器有足够的上下边距用于滚动定位 */
.message {
  scroll-margin: 100px;
}

/* 添加消息动画 */
.message-animate {
  animation: message-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center left;
}

.message-self.message-animate {
  transform-origin: center right;
}

@keyframes message-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 优化点赞动画 */
.action-count {
  display: inline-block;
  animation: count-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes count-pop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* 消息主体样式 */
.message-main {
  display: flex;
  gap: 12px;
}

.message-body {
  flex: 1;
  min-width: 0;
}

/* 自己发送的消息样式调整 */
.message-self .message-main {
  flex-direction: row-reverse;
}

.message-self .message-content {
  background-color: #95ec69;
}

.message-self .reply-reference {
  border-left: none;
  border-right: 3px solid #409eff;
  text-align: right;
}

.message-self .reference-text {
  padding-left: 0;
  padding-right: 20px;
}

/* 添加消息连接线 */
.reply-reference::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 2px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
}

.message-self .reply-reference::after {
  left: auto;
  right: 20px;
}

.voice-message {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #fff;
  transition: all 0.3s;
}

.voice-message:hover {
  background-color: #f5f7fa;
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
}

.voice-wave span {
  display: inline-block;
  width: 3px;
  height: 100%;
  background-color: #409eff;
  border-radius: 2px;
  transform-origin: center;
}

.voice-wave.playing span {
  animation: wave 1s ease infinite;
}

.voice-wave span:nth-child(2) {
  animation-delay: 0.2s;
}

.voice-wave span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%, 100% { height: 8px; }
  50% { height: 16px; }
}

.voice-duration {
  font-size: 12px;
  color: #909399;
}
</style> 