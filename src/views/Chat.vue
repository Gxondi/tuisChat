/**
 * TODO: 后端接口
 * 1. 获取消息历史
 * GET /api/messages?chatId={chatId}&page={page}&size={size}
 * Response: { messages: Message[], total: number }
 * 
 * 2. 发送消息
 * POST /api/messages
 * Body: { chatId, content, type, replyTo? }
 * Response: { message: Message }
 * 
 * 3. 获取聊天列表
 * GET /api/chats
 * Response: { chats: Chat[] }
 * 
 * 4. 上传文件
 * POST /api/upload
 * FormData: { file }
 * Response: { url: string }
 */
<template>
  <div class="chat-layout">
    <!-- 左侧个人信息 -->
    <div class="sidebar">
      <user-profile />
    </div>

    <!-- 中间导航和列表 -->
    <div class="nav-panel">
      <side-navigation @change="handleNavChange" />
      <div class="panel-content scrollable">
        <contacts-panel 
          v-if="currentPanel === 'contacts'" 
          @select-contact="handleContactSelect"
        />
        <div v-else class="messages-list">
          <div
            v-for="chat in recentChats"
            :key="chat.id"
            class="chat-item"
            :class="{ active: currentChat.id === chat.id }"
            @click="selectChat(chat)"
          >
            <el-avatar :size="40" :src="chat.avatar">
              {{ chat.name.charAt(0) }}
            </el-avatar>
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="last-message">{{ chat.lastMessage }}</div>
            </div>
            <div class="chat-meta">
              <div class="time">{{ chat.lastTime }}</div>
              <el-badge v-if="chat.unread" :value="chat.unread" class="unread" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-content">
      <div class="chat-header">
        <div class="header-content">
          <div class="chat-info">
            <h2>{{ currentChat.name }}</h2>
            <span v-if="currentChat.type === 'group'" class="chat-type">
              {{ t('chat.groupChat') }}
            </span>
          </div>
          <div class="header-actions">
            <el-button-group>
              <el-button :icon="Search">{{ t('common.search') }}</el-button>
              <el-button :icon="Setting">{{ t('common.settings') }}</el-button>
            </el-button-group>
          </div>
        </div>
      </div>

      <div class="chat-messages scrollable" ref="messagesContainer">
        <message-bubble
          v-for="message in currentMessages"
          :key="message.id"
          :id="message.id"
          :content="message.content"
          :sender="message.sender"
          :timestamp="message.timestamp"
          :type="message.type"
          :is-self="message.sender === chatStore.currentUser?.id"
          :avatar="getUserAvatar(message.sender)"
          :reply-to="message.replyTo"
          @reply="handleReply"
        />
      </div>

      <div class="chat-input">
        <chat-toolbar
          @select-emoji="insertEmoji"
          @select-image="handleImageUpload"
          @select-file="handleFileUpload"
          @toggle-mention="showUserList = !showUserList"
        />
        <div class="input-container">
          <!-- 语音按钮 -->
          <div 
            class="voice-btn"
            @mousedown="startRecording"
            @mouseup="stopRecording"
            @mouseleave="cancelRecording"
          >
            <el-tooltip :content="isRecording ? t('chat.recording') : t('chat.holdToSpeak')" placement="top">
              <el-icon :class="{ 'recording': isRecording }">
                <Microphone />
              </el-icon>
            </el-tooltip>
            <div v-if="isRecording" class="recording-indicator">
              <div class="recording-waves"></div>
              <span class="recording-time">{{ recordingTime }}s</span>
            </div>
          </div>

          <!-- 消息输入框 -->
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="1"
            :placeholder="t('chat.inputMessage')"
            @keyup.enter.exact.prevent="sendMessage"
            @keyup.enter.shift.exact="newMessage += '\n'"
            resize="none"
            ref="messageInput"
          />

          <!-- 发送按钮 -->
          <el-button 
            type="primary" 
            @click="sendMessage" 
            :disabled="!newMessage.trim()"
          >
            {{ t('common.send') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 右侧在线人数（仅群聊显示） -->
    <div v-if="currentChat.type === 'group'" class="online-panel">
      <online-users :users="onlineUsers" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { ElMessage } from 'element-plus'
import { PictureFilled, Folder, User, Search, Setting, Microphone } from '@element-plus/icons-vue'
import MessageBubble from '../components/MessageBubble.vue'
import ChatToolbar from '../components/ChatToolbar.vue'
import UserProfile from '../components/UserProfile.vue'
import SideNavigation from '../components/SideNavigation.vue'
import ContactsPanel from '../components/ContactsPanel.vue'
import OnlineUsers from '../components/OnlineUsers.vue'
import { wsService } from '../services/websocket'
import { useI18n } from 'vue-i18n'
import { mockApi } from '../services/mock'

const { t } = useI18n()
const router = useRouter()
const chatStore = useChatStore()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// 修改在线用户数据的类型和结构
interface OnlineUser {
  id: number
  name: string
  avatar: string
  isOnline: boolean
}

// 模拟在线用户数据
const onlineUsers = ref<OnlineUser[]>([
  {
    id: 1,
    name: chatStore.currentUser?.name || '未知用户',
    avatar: '',
    isOnline: true
  },
  {
    id: 2,
    name: '佐藤さん',
    avatar: '',
    isOnline: true
  },
  {
    id: 3,
    name: '田中さん',
    avatar: '',
    isOnline: false
  }
])

// 如果未登录，重定向到登录页
if (!chatStore.currentUser) {
  router.push('/')
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 获取消息列表
const fetchMessages = async () => {
  try {
    const response = await mockApi.getMessages(currentChat.id)
    if (response.code === 200) {
      chatStore.messages[currentChat.id] = response.data
    }
  } catch (error) {
    console.error('获取消息失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    chatId: currentChat.id,
    content: newMessage.value,
    sender: chatStore.currentUser!.id,
    type: 'text'
  }
  
  try {
    const response = await mockApi.sendMessage(message)
    if (response.code === 200) {
      chatStore.addMessage(currentChat.id, response.data)
      newMessage.value = ''
      scrollToBottom()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 获取聊天列表
const fetchChats = async () => {
  try {
    const response = await mockApi.getChats()
    if (response.code === 200) {
      recentChats.value = response.data
    }
  } catch (error) {
    console.error('获取聊天列表失败:', error)
  }
}

// 在组件挂载时获取数据
onMounted(async () => {
  await fetchChats()
  if (currentChat.id) {
    await fetchMessages()
  }
})

watch(() => chatStore.messages.length, scrollToBottom)
onMounted(scrollToBottom)

// 新增的响式数据
const showEmoji = ref(false)
const showUserList = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const messageInput = ref()

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  // 可以添加更多表情
]

// 插入表情
const insertEmoji = (emoji: string) => {
  newMessage.value += emoji
  messageInput.value?.focus()
}

// @用户
const mentionUser = (user: { name: string }) => {
  newMessage.value += `@${user.name} `
  showUserList.value = false
  messageInput.value.focus()
}

// 处理图片上传
const handleImageUpload = async (file: File) => {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target?.result as string
    chatStore.addMessage(currentChat.id, {
      content: imageUrl,
      sender: chatStore.currentUser!.id,
      type: 'image'
    })
  }
  reader.readAsDataURL(file)
  return false
}

// 处理文件上传
const handleFileUpload = async (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }

  chatStore.addMessage(currentChat.id, {
    content: `${file.name}|${(file.size / 1024).toFixed(2)}KB`,
    sender: chatStore.currentUser!.id,
    type: 'file'
  })
  return false
}

// 在 script setup 部分添加这个方法
const getUserAvatar = (username: string) => {
  const user = onlineUsers.value.find(u => u.name === username)
  return user?.avatar || ''
}

const currentPanel = ref('messages')
const currentChat = reactive({
  id: 1,
  name: '交流群',
  type: 'group' as 'group' | 'private'
})

const handleNavChange = (key: string) => {
  currentPanel.value = key
}

const handleLikeMessage = (message: any) => {
  // 处理消息点赞逻辑
}

// 添加最近聊天列表数据
const recentChats = ref([
  {
    id: 1,
    name: '交流群',
    type: 'group',
    avatar: '',
    lastMessage: '大家好！',
    lastTime: '12:30',
    unread: 3
  },
  {
    id: 2,
    name: '张三',
    type: 'private',
    avatar: '',
    lastMessage: '好的，明天见！',
    lastTime: '11:20',
    unread: 0
  }
])

const selectChat = (chat: any) => {
  Object.assign(currentChat, chat)
}

// 添加联系人选择处理函数
const handleContactSelect = (contact: any) => {
  // 添加到最近聊天列表（如果不存在）
  const existingChat = recentChats.value.find(chat => chat.id === contact.id)
  if (!existingChat) {
    recentChats.value.push(contact)
  }
  
  // 切换到消息面板
  currentPanel.value = 'messages'
  
  // 选中该聊天
  selectChat(contact)
}

// 更新处理回复的函数
const handleReply = ({ content, replyTo }) => {
  const message = {
    content,
    sender: chatStore.currentUser!.id,
    type: 'text',
    replyTo
  }
  
  chatStore.addMessage(currentChat.id, message)
  scrollToBottom()
}

// 监听输入状态
let typingTimeout: number | null = null
const handleInput = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  wsService.sendTypingStatus(true)
  
  typingTimeout = window.setTimeout(() => {
    wsService.sendTypingStatus(false)
  }, 1000)
}

// 处理消息反应
const handleReaction = (messageId: number, reaction: string) => {
  wsService.sendReaction(messageId, reaction)
}

// 组件卸载时断开连接
onUnmounted(() => {
  wsService.disconnect()
})

// 修改消息显示部分
const currentMessages = computed(() => {
  return chatStore.messages[currentChat.id] || []
})

// 在 script setup 中添加录音相关的状态
const isRecording = ref(false)
const recordingTime = ref(0)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingTimer: number | null = null

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      handleVoiceMessage(audioBlob)
      stopRecordingTimer()
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    startRecordingTimer()
    
  } catch (error) {
    console.error('录音错误:', error)
    ElMessage.error(t('chat.microphoneError'))
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

// 取消录音
const cancelRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    audioChunks = []
    stopRecordingTimer()
  }
}

// 开始计时
const startRecordingTimer = () => {
  recordingTime.value = 0
  recordingTimer = window.setInterval(() => {
    recordingTime.value++
    if (recordingTime.value >= 60) { // 最长录音时间限制
      stopRecording()
    }
  }, 1000)
}

// 停止计时
const stopRecordingTimer = () => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

// 处理语音消息
const handleVoiceMessage = async (audioBlob: Blob) => {
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Audio = e.target?.result as string
      
      chatStore.addMessage(currentChat.id, {
        content: base64Audio,
        sender: chatStore.currentUser!.id,
        type: 'voice'
      })
    }
    reader.readAsDataURL(audioBlob)
  } catch (error) {
    console.error('处理语音消息失败:', error)
    ElMessage.error(t('chat.voiceUploadFailed'))
  }
}

// 组件卸载时清理
onUnmounted(() => {
  stopRecording()
  stopRecordingTimer()
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 80px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.nav-panel {
  width: 250px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.messages-list {
  height: 100%;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.last-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  text-align: right;
}

.time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.online-panel {
  width: 250px;
  background-color: #fff;
}

.chat-type {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.chat-header {
  height: 60px;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.online-count {
  font-size: 14px;
  color: #909399;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.chat-input {
  border-top: 1px solid #e6e6e6;
  background-color: #fff;
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  align-items: center;
  height: 50px;
}

.el-input {
  flex: 1;
}

.el-input :deep(.el-textarea__inner) {
  height: 40px !important;
  min-height: 40px !important;
  padding: 8px 12px;
  line-height: 24px;
  resize: none;
}

/* 优化滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 添加消息加载动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 语音按钮样式 */
.voice-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.voice-btn:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.voice-btn .el-icon {
  font-size: 20px;
  color: #606266;
  transition: all 0.3s;
}

.voice-btn .recording {
  color: #f56c6c;
  animation: pulse 1s infinite;
}

.recording-indicator {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.recording-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(245, 108, 108, 0.2);
  animation: waves 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes waves {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 40px;
    height: 40px;
    opacity: 0;
  }
}

.el-button {
  height: 40px;
  flex-shrink: 0;
}
</style> 