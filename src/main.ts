import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import MessageBubble from './components/MessageBubble.vue'
import ChatToolbar from './components/ChatToolbar.vue'
import UserProfile from './components/UserProfile.vue'
import UserBadge from './components/UserBadge.vue'
import SideNavigation from './components/SideNavigation.vue'
import ContactsPanel from './components/ContactsPanel.vue'
import CreateGroup from './components/CreateGroup.vue'
import NewFriends from './components/NewFriends.vue'
import i18n from './i18n'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIcons)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.component('MessageBubble', MessageBubble)
app.component('ChatToolbar', ChatToolbar)
app.component('UserProfile', UserProfile)
app.component('UserBadge', UserBadge)
app.component('SideNavigation', SideNavigation)
app.component('ContactsPanel', ContactsPanel)
app.component('CreateGroup', CreateGroup)
app.component('NewFriends', NewFriends)
app.use(i18n)

app.mount('#app') 