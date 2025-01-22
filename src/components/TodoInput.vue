<template>
  <el-card class="todo-input-card">
    <div class="todo-input-form">
      <el-input
        v-model="todoText"
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 8 }"
        placeholder="添加新的待办事项..."
        class="todo-textarea"
      />
      <div class="input-actions">
        <el-date-picker
          v-model="dueDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          popper-class="todo-date-picker"
          :placement="'bottom-start'"
          class="date-picker"
        />
        <el-button 
          type="primary" 
          :icon="Plus"
          @click="handleSubmit"
          size="large"
        >
          添加
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['add-todo'])
const todoText = ref('')
const dueDate = ref(null)

const dateShortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '明天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '一周后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
      return date
    },
  },
]

const handleSubmit = () => {
  if (todoText.value.trim()) {
    emit('add-todo', {
      text: todoText.value,
      date: dueDate.value
    })
    todoText.value = ''
    dueDate.value = null
  }
}
</script>

<style scoped>
.todo-input-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--el-box-shadow-light) !important;
}

.todo-input-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0; /* 重要：防止溢出 */
}

.todo-textarea {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：防止溢出 */
  
  :deep(.el-textarea__inner) {
    height: 100% !important;
    max-height: none !important;
    resize: none;
    font-size: 1rem;
    line-height: 1.6;
    padding: 1rem;
  }
}

.input-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0; /* 防止按钮区域被压缩 */
}

.date-picker {
  flex: 1;
}

/* 美化输入框 */
:deep(.el-textarea__inner) {
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  padding: 1rem;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  background-color: var(--el-bg-color);
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

/* 日期选择器样式优化 */
:deep(.el-date-picker) {
  margin-top: 8px;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-picker-panel__sidebar) {
  border-right: 1px solid var(--el-border-color-lighter);
}

:deep(.el-picker-panel__shortcut) {
  padding: 0.5rem 1rem;
  color: var(--el-text-color-regular);
  transition: all 0.3s ease;
}

:deep(.el-picker-panel__shortcut:hover) {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}
</style> 