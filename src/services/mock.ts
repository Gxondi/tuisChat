// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟响应数据
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 模拟API响应
const mockResponse = async <T>(data: T, delayTime = 1000): Promise<ApiResponse<T>> => {
  await delay(delayTime)
  return {
    code: 200,
    message: 'success',
    data
  }
}

// 模拟数据
const mockData = {
  users: [
    { id: 1, name: '田中さん', avatar: '', status: 'online' },
    { id: 2, name: '佐藤さん', avatar: '', status: 'away' },
    { id: 3, name: '鈴木さん', avatar: '', status: 'offline' }
  ],
  messages: [
    {
      id: 1,
      chatId: 1,
      content: 'こんにちは！',
      sender: '田中さん',
      timestamp: new Date(),
      type: 'text'
    }
  ],
  chats: [
    {
      id: 1,
      name: '交流グループ',
      type: 'group',
      avatar: '',
      members: [1, 2, 3],
      lastMessage: 'こんにちは！',
      lastTime: '12:30'
    }
  ]
}

// 模拟API
export const mockApi = {
  // 用户相关
  async login(username: string) {
    return mockResponse({
      id: Date.now(),
      name: username,
      avatar: '',
      token: 'mock_token_' + Date.now()
    })
  },

  async getUsers() {
    return mockResponse(mockData.users)
  },

  async getUserProfile(userId: number) {
    const user = mockData.users.find(u => u.id === userId)
    return mockResponse(user)
  },

  // 消息相关
  async getMessages(chatId: number) {
    const messages = mockData.messages.filter(m => m.chatId === chatId)
    return mockResponse(messages)
  },

  async sendMessage(message: any) {
    const newMessage = {
      id: Date.now(),
      timestamp: new Date(),
      ...message
    }
    mockData.messages.push(newMessage)
    return mockResponse(newMessage)
  },

  // 聊天相关
  async getChats() {
    return mockResponse(mockData.chats)
  },

  async createChat(chat: any) {
    const newChat = {
      id: Date.now(),
      ...chat
    }
    mockData.chats.push(newChat)
    return mockResponse(newChat)
  }
} 