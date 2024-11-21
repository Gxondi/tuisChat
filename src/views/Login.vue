<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="50" class="logo"><ChatRound /></el-icon>
        <h1>{{ t('login.title') }}</h1>
        <p class="subtitle">{{ t('login.subtitle') }}</p>
      </div>

      <div class="login-form">
        <!-- Google登录按钮 -->
        <div class="google-btn" @click="handleGoogleLogin">
          <div class="google-icon-wrapper">
            <img class="google-icon" src="/google.svg" alt="Google Logo"/>
          </div>
          <p class="btn-text">{{ t('login.googleLogin') }}</p>
        </div>

        <!-- 分割线 -->
        <div class="divider">
          <span>{{ t('common.or') }}</span>
        </div>

        <!-- 游客登录 -->
        <div class="guest-login">
          <el-input
            v-model="username"
            :placeholder="t('login.enterNickname')"
            :prefix-icon="User"
            class="guest-input"
          />
          <el-button 
            type="primary" 
            @click="handleGuestLogin" 
            :loading="loading"
            class="guest-btn"
          >
            {{ t('login.guestLogin') }}
          </el-button>
        </div>
      </div>

      <div class="login-footer">
        <p>{{ t('login.agreement', { 
          terms: t('login.terms'), 
          privacy: t('login.privacy') 
        }) }}</p>
      </div>
    </div>

    <!-- 服务条款对话框 -->
    <el-dialog
      v-model="termsVisible"
      :title="t('login.terms')"
      width="50%"
    >
      <div class="terms-content">
        <h3>{{ t('login.terms') }}</h3>
        <p>{{ t('login.termsContent') }}</p>
      </div>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="privacyVisible"
      :title="t('login.privacy')"
      width="50%"
    >
      <div class="privacy-content">
        <h3>{{ t('login.privacy') }}</h3>
        <p>{{ t('login.privacyContent') }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, ChatRound } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const chatStore = useChatStore()
const username = ref('')
const loading = ref(false)
const termsVisible = ref(false)
const privacyVisible = ref(false)

const handleGoogleLogin = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const googleUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      picture: 'https://example.com/avatar.jpg'
    }
    chatStore.setCurrentUser(googleUser.name)
    ElMessage.success(t('login.loginSuccess'))
    router.push('/chat')
  } catch (error) {
    ElMessage.error(t('login.loginError'))
  } finally {
    loading.value = false
  }
}

const handleGuestLogin = () => {
  if (!username.value.trim()) {
    ElMessage.warning(t('login.enterNicknameWarning'))
    return
  }
  
  loading.value = true
  chatStore.setCurrentUser(`${t('login.guestPrefix')}_${username.value}`)
  setTimeout(() => {
    loading.value = false
    router.push('/chat')
  }, 1000)
}

const showTerms = () => {
  termsVisible.value = true
}

const showPrivacy = () => {
  privacyVisible.value = true
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
  animation: slideUp 0.5s ease;
}

.login-header {
  margin-bottom: 30px;
}

.logo {
  color: #409eff;
  margin-bottom: 16px;
  animation: bounce 1s ease infinite;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.google-btn {
  width: 100%;
  height: 42px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.google-btn:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.google-icon-wrapper {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.btn-text {
  flex: 1;
  text-align: center;
  color: #757575;
  font-size: 14px;
  font-weight: 500;
}

.divider {
  margin: 24px 0;
  display: flex;
  align-items: center;
  color: #999;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 16px;
  font-size: 14px;
}

.guest-login {
  margin-top: 24px;
}

.guest-input {
  margin-bottom: 16px;
}

.guest-btn {
  width: 100%;
}

.login-footer {
  margin-top: 24px;
  font-size: 12px;
  color: #666;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style> 