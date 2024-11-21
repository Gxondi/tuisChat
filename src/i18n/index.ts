import { createI18n } from 'vue-i18n'
import ja from '../locales/ja'
import zh from '../locales/zh'
import en from '../locales/en'

// 获取用户偏好语言，默认为日语
const savedLanguage = localStorage.getItem('preferred-language') || 'ja'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'ja',
  messages: {
    ja,
    zh,
    en
  }
})

export default i18n 