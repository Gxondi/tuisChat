import { useChatStore } from '../stores/chat'

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 3000
  private heartbeatInterval: number | null = null

  constructor(private url: string) {}

  connect(userId: string) {
    try {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`)
      this.setupEventHandlers()
      this.startHeartbeat()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private handleMessage(data: any) {
    const chatStore = useChatStore()
    
    switch (data.type) {
      case 'message':
        chatStore.addMessage(
          data.content,
          data.sender,
          data.messageType || 'text',
          data.replyTo
        )
        break
      
      case 'user_status':
        chatStore.updateUserStatus(data.userId, data.status)
        break
      
      case 'typing':
        chatStore.setUserTyping(data.userId, data.isTyping)
        break
      
      case 'reaction':
        chatStore.updateMessageReaction(data.messageId, data.reaction, data.userId)
        break
      
      case 'online_users':
        chatStore.updateOnlineUsers(data.users)
        break
      
      case 'pong':
        // 心跳响应，不需要处理
        break
      
      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect(useChatStore().currentUser || '')
    }, this.reconnectDelay)
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.sendMessage({
        type: 'ping'
      })
    }, 30000) // 每30秒发送一次心跳
  }

  sendMessage(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  sendChatMessage(content: string, type: string = 'text', replyTo?: any) {
    this.sendMessage({
      type: 'message',
      content,
      messageType: type,
      replyTo
    })
  }

  sendTypingStatus(isTyping: boolean) {
    this.sendMessage({
      type: 'typing',
      isTyping
    })
  }

  sendReaction(messageId: number, reaction: string) {
    this.sendMessage({
      type: 'reaction',
      messageId,
      reaction
    })
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// 创建单例实例
export const wsService = new WebSocketService('ws://your-websocket-server-url') 