<template>
  <div class="side-navigation">
    <div class="nav-items">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeNav === item.key }"
        @click="handleNavClick(item.key)"
      >
        <el-badge :value="item.badge" :hidden="!item.badge" class="nav-badge">
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        </el-badge>
        <span class="nav-label">{{ t(`chat.${item.key}`) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatDotRound, UserFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'change', key: string): void
}>()

const activeNav = ref('messages')

const navItems = [
  {
    key: 'messages',
    icon: ChatDotRound,
    badge: 3
  },
  {
    key: 'contacts',
    icon: UserFilled,
    badge: 0
  }
]

const handleNavClick = (key: string) => {
  activeNav.value = key
  emit('change', key)
}
</script>

<style scoped>
.side-navigation {
  padding: 10px 0;
  border-bottom: 1px solid #e6e6e6;
}

.nav-items {
  display: flex;
  justify-content: space-around;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: currentColor;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.nav-icon {
  transition: transform 0.3s;
}

.nav-item:hover .nav-icon {
  transform: scale(1.2);
}

.nav-label {
  position: relative;
}

.nav-label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.3s;
}

.nav-item:hover .nav-label::after {
  transform: scaleX(1);
}

.nav-badge :deep(.el-badge__content) {
  transition: transform 0.3s;
}

.nav-badge:hover :deep(.el-badge__content) {
  transform: scale(1.2);
}
</style> 