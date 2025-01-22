<template>
  <div class="app-container">
    <!-- 自定义标题栏 -->
    <div class="titlebar">
      <div class="titlebar-drag">TODO</div>
      <div class="titlebar-buttons">
        <button @click="minimizeWindow" class="titlebar-button">─</button>
        <button @click="maximizeWindow" class="titlebar-button">□</button>
        <button @click="closeWindow" class="titlebar-button">×</button>
      </div>
    </div>

    <div class="main-container">
      <div class="content-wrapper">
        <!-- 左侧输入区域 -->
        <div class="input-section">
          <TodoInput @add-todo="addTodo" />
        </div>

        <!-- 右侧列表区域 -->
        <div class="list-section">
          <TodoList
            :todos="filteredTodos"
            v-model:filter="currentFilter"
            v-model:dateFilter="currentDateFilter"
            @toggle-todo="toggleTodo"
            @delete-todo="deleteTodo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'

const todos = ref([])
const currentFilter = ref('all')
const currentDateFilter = ref('all')
const currentDate = ref(new Date())

// 从 localStorage 加载数据
onMounted(() => {
  const savedTodos = localStorage.getItem('todos')
  if (savedTodos) {
    todos.value = JSON.parse(savedTodos)
  }
})

// 监听数据变化并保存到 localStorage
watch(todos, (newTodos) => {
  localStorage.setItem('todos', JSON.stringify(newTodos))
}, { deep: true })

// 添加待办事项
const addTodo = (todo) => {
  todos.value.push({
    id: Date.now(),
    text: todo.text,
    date: todo.date,
    completed: false
  })
}

// 切换待办事项状态
const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

// 删除待办事项
const deleteTodo = (id) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    todos.value.splice(index, 1)
  }
}

// 窗口控制
const minimizeWindow = () => {
  window.api.window.minimize()
}

const maximizeWindow = () => {
  window.api.window.maximize()
}

const closeWindow = () => {
  window.api.window.close()
}

// 过滤待办事项
const filteredTodos = computed(() => {
  let filtered = todos.value

  // 状态过滤
  if (currentFilter.value === 'active') {
    filtered = filtered.filter(t => !t.completed)
  } else if (currentFilter.value === 'completed') {
    filtered = filtered.filter(t => t.completed)
  }

  // 日期过滤
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  if (currentDateFilter.value === 'today') {
    filtered = filtered.filter(t => t.date === today)
  } else if (currentDateFilter.value === 'tomorrow') {
    filtered = filtered.filter(t => t.date === tomorrow)
  } else if (currentDateFilter.value === 'future') {
    filtered = filtered.filter(t => t.date && t.date > tomorrow)
  } else if (currentDateFilter.value === 'nodate') {
    filtered = filtered.filter(t => !t.date)
  }

  return filtered
})

// 格式化日历标题
const formatCalendarTitle = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long'
  })
}

// 检查指定日期是否有待办事项
const hasTodosOnDate = (date) => {
  return todos.value.some(todo => todo.date === date)
}

// 获取指定日期的待办事项数量
const getTodoCountOnDate = (date) => {
  return todos.value.filter(todo => todo.date === date).length
}
</script>

<style>
:root {
  --titlebar-height: 32px;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100%;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

.titlebar {
  height: var(--titlebar-height);
  flex-shrink: 0; /* 防止标题栏被压缩 */
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  -webkit-app-region: drag;
}

.titlebar-buttons {
  -webkit-app-region: no-drag;
  display: flex;
  gap: 0.5rem;
}

.titlebar-button {
  border: none;
  background: none;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: var(--el-border-radius-base);
  -webkit-app-region: no-drag;
}

.titlebar-button:hover {
  background-color: var(--el-fill-color-light);
}

.main-container {
  flex: 1;
  min-height: 0;
  padding: 1.25rem;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  display: flex;
  gap: 1.25rem;
}

.input-section {
  width: 400px; /* 固定宽度 */
  flex-shrink: 0; /* 防止被压缩 */
  display: flex;
  flex-direction: column;
}

.list-section {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
  display: flex;
  flex-direction: column;
}

/* 响应式布局 */
@media screen and (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }

  .input-section {
    width: 100%;
    height: auto;
    min-height: 200px;
  }

  .list-section {
    min-height: 400px;
  }
}

/* 更小屏幕的优化 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }

  .content-wrapper {
    gap: 1rem;
  }

  .input-section {
    min-height: 180px;
  }

  .list-section {
    min-height: 300px;
  }
}

/* 移除 element-plus 的默认边距 */
:deep(.el-row) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

:deep(.el-col) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Element Plus 全局样式覆盖 */
.el-card {
  --el-card-padding: 1.25rem;
  border: none !important;
}

.el-button {
  --el-button-size: 2rem;
}

.el-tag {
  --el-tag-size: 1.75rem;
}

/* 添加新的样式 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  overflow: hidden;
}

.calendar-wrapper {
  flex: 1;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-calendar) {
  --el-calendar-header-height: auto;
  background: none;
  border: none;
}

:deep(.el-calendar__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.calendar-header {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.el-calendar__body) {
  padding: 12px;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
}

.todo-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 9px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.has-todos {
  color: var(--el-color-primary);
  font-weight: 500;
}

:deep(.el-calendar-table .el-calendar-day:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-calendar-table td.is-selected) {
  background-color: var(--el-color-primary-light-9);
}
</style> 