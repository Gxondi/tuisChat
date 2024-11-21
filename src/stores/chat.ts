import { defineStore } from 'pinia'
import { wsService } from '../services/websocket'

interface Message {
  id: number
  content: string
  sender: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  replyTo?: {
    id: number
    sender: string
    content: string
    type: 'text' | 'image' | 'file'
  }
  reactions: {
    likes: string[]
    dislikes: string[]
  }
}

interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastActive: Date
}

interface ChatState {
  currentUser: User | null
  messages: { [chatId: number]: Message[] }
  currentChatId: number | null
  contacts: User[]
  onlineUsers: Set<string>
  typingUsers: Set<string>
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    currentUser: null,
    messages: {},
    currentChatId: null,
    contacts: [],
    onlineUsers: new Set(),
    typingUsers: new Set()
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    
    currentMessages: (state) => {
      return state.currentChatId ? state.messages[state.currentChatId] || [] : []
    }
  },

  actions: {
    setCurrentUser(user: User | string) {
      if (typeof user === 'string') {
        this.currentUser = {
          id: Date.now().toString(),
          name: user,
          avatar: '',
          status: 'online',
          lastActive: new Date()
        }
      } else {
        this.currentUser = user
      }
      wsService.connect(this.currentUser.id)
    },

    addMessage(chatId: number, message: Omit<Message, 'id' | 'timestamp' | 'reactions'>) {
      if (!this.messages[chatId]) {
        this.messages[chatId] = []
      }

      const newMessage: Message = {
        ...message,
        id: Date.now(),
        timestamp: new Date(),
        reactions: {
          likes: [],
          dislikes: []
        }
      }

      this.messages[chatId].push(newMessage)

      if (message.sender === this.currentUser?.id) {
        wsService.sendChatMessage(message.content, message.type, message.replyTo)
      }
    },

    logout() {
      wsService.disconnect()
      this.$reset()
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'chat-store',
        storage: localStorage,
        paths: ['currentUser']
      }
    ]
  }
}) 