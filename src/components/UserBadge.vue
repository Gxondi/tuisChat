<template>
  <el-tooltip placement="top">
    <template #content>
      <div>
        {{ badge.description }}
        <slot name="description"></slot>
      </div>
    </template>
    <div class="badge-item" :class="{ 'is-special': badge.isSpecial, 'is-disabled': disabled } ">
      <el-icon><component :is="badge.icon" /></el-icon>
      <span class="badge-name">{{ badge.name }}</span>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
defineProps<{
  badge: {
    name: string
    description: string
    icon: string
    isSpecial?: boolean
  }
  disabled?: boolean
}>()
</script>

<style scoped>
.badge-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f5f7fa;
  margin: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.badge-item:hover:not(.is-disabled) {
  transform: scale(1.05);
}

.is-special {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  color: white;
}

.is-disabled {
  opacity: 0.5;
  cursor: default;
  filter: grayscale(100%);
}

.badge-name {
  font-size: 12px;
}
</style> 