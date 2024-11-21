/**
 * TODO: 后端接口
 * 1. 创建群组
 * POST /api/groups
 * Body: { name, members }
 * Response: { group: Group }
 * 
 * 2. 获取可选成员
 * GET /api/contacts/available
 * Response: { contacts: Contact[] }
 * 
 * 3. 上传群头像
 * POST /api/groups/avatar
 * FormData: { avatar }
 * Response: { url: string }
 */
<template>
  <div class="create-group">
    <el-button type="primary" class="create-btn" @click="showDialog = true">
      <el-icon><Plus /></el-icon>{{ t('chat.createGroup') }}
    </el-button>

    <el-dialog
      v-model="showDialog"
      :title="t('chat.createGroup')"
      width="500px"
    >
      <el-form :model="groupForm" label-width="120px">
        <el-form-item :label="t('chat.groupName')">
          <el-input v-model="groupForm.name" :placeholder="t('chat.enterGroupName')" />
        </el-form-item>
        <el-form-item :label="t('chat.groupMembers')">
          <el-select
            v-model="groupForm.members"
            multiple
            filterable
            :placeholder="t('chat.selectMembers')"
            style="width: 100%"
          >
            <el-option
              v-for="contact in contacts"
              :key="contact.id"
              :label="contact.name"
              :value="contact.id"
            >
              <div class="member-option">
                <el-avatar :size="24" :src="contact.avatar">
                  {{ contact.name.charAt(0) }}
                </el-avatar>
                <span>{{ contact.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="createGroup">{{ t('common.create') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showDialog = ref(false)
const groupForm = reactive({
  name: '',
  members: [] as number[]
})

// 模拟联系人数据
const contacts = [
  { id: 1, name: '田中さん', avatar: '' },
  { id: 2, name: '佐藤さん', avatar: '' },
  { id: 3, name: '鈴木さん', avatar: '' }
]

const createGroup = () => {
  if (!groupForm.name.trim()) {
    ElMessage.warning(t('chat.groupNameRequired'))
    return
  }
  if (groupForm.members.length < 2) {
    ElMessage.warning(t('chat.minimumMembersRequired'))
    return
  }
  
  // TODO: 创建群聊逻辑
  ElMessage.success(t('chat.groupCreated'))
  showDialog.value = false
  groupForm.name = ''
  groupForm.members = []
}
</script>

<style scoped>
.create-group {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.create-btn {
  width: 100%;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 