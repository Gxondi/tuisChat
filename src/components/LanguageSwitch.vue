<template>
  <el-dropdown @command="handleLanguageChange">
    <el-button type="text">
      <el-icon><Location /></el-icon>
      {{ currentLanguageLabel }}
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="ja">日本語</el-dropdown-item>
        <el-dropdown-item command="zh">中文</el-dropdown-item>
        <el-dropdown-item command="en">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Location } from '@element-plus/icons-vue'

const { locale } = useI18n()

const currentLanguageLabel = computed(() => {
  switch (locale.value) {
    case 'ja':
      return '日本語'
    case 'zh':
      return '中文'
    case 'en':
      return 'English'
    default:
      return '日本語'
  }
})

const handleLanguageChange = (lang: string) => {
  locale.value = lang
  // 可以保存用户语言偏好
  localStorage.setItem('preferred-language', lang)
}
</script> 