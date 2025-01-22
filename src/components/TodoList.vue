<template>
  <el-card class="todo-list-card">
    <!-- 头部统计和视图切换 -->
    <div class="list-header">
      <div class="header-left">
        <el-tag size="large" type="info" effect="plain">总计: {{ stats.totalCount }}</el-tag>
        <el-tag size="large" type="success" effect="plain">已完成: {{ stats.completedCount }}</el-tag>
        <el-tag size="large" type="warning" effect="plain">待完成: {{ stats.pendingCount }}</el-tag>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            @click="viewMode = 'list'"
          >列表视图</el-button>
          <el-button 
            :type="viewMode === 'calendar' ? 'primary' : ''" 
            @click="viewMode = 'calendar'"
          >日历视图</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <template v-if="viewMode === 'list'">
      <!-- 添加选中日期提示 -->
      <div v-if="selectedDate && dateFilter === 'selected'" class="selected-date-info">
        当前显示: {{ formatDate(selectedDate) }} 的待办事项
      </div>

      <!-- 过滤器 -->
      <div class="filter-container">
        <div class="filter-row">
          <el-button
            v-for="f in filters"
            :key="f.value"
            :type="filter === f.value ? 'primary' : ''"
            @click="$emit('update:filter', f.value)"
          >
            {{ f.label }}
          </el-button>
        </div>
        <div class="filter-row">
          <el-button
            v-for="f in dateFilters"
            :key="f.value"
            :type="dateFilter === f.value ? 'success' : ''"
            @click="$emit('update:dateFilter', f.value)"
          >
            {{ f.label }}
          </el-button>
        </div>
      </div>

      <!-- 列表内容 -->
      <div class="list-content">
        <el-scrollbar>
          <template v-if="filteredTodos.length === 0">
            <div class="empty-state">
              <el-empty>
                <template #description>
                  <p class="empty-text">{{ getEmptyStateMessage() }}</p>
                </template>
              </el-empty>
            </div>
          </template>
          <template v-else>
            <div class="todo-items">
              <div 
                v-for="todo in paginatedTodos" 
                :key="todo.id"
                class="todo-item"
              >
                <div class="todo-item-left">
                  <el-checkbox
                    :model-value="todo.completed"
                    @change="$emit('toggle-todo', todo.id)"
                  />
                  <span class="todo-text" :class="{ completed: todo.completed }">
                    {{ todo.text }}
                  </span>
                </div>
                <div class="todo-item-right">
                  <el-tag v-if="todo.date" size="small" type="info">
                    {{ formatDate(todo.date) }}
                  </el-tag>
                  <el-button
                    type="danger"
                    :icon="Delete"
                    circle
                    size="small"
                    @click="$emit('delete-todo', todo.id)"
                  />
                </div>
              </div>
            </div>
          </template>
        </el-scrollbar>
        
        <!-- 分页器只在有内容时显示 -->
        <div v-if="filteredTodos.length > 0" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredTodos.length"
            layout="sizes, prev, pager, next"
            background
          />
        </div>
      </div>
    </template>

    <!-- 日历视图 -->
    <div v-else class="calendar-container">
      <el-calendar v-model="currentDate">
        <template #header="{ date }">
          <div class="calendar-header">{{ formatCalendarTitle(date) }}</div>
        </template>
        <template #date-cell="{ data }">
          <div 
            class="calendar-cell"
            :class="{
              'is-today': isToday(data.day),
              'has-todos': hasTodosOnDate(data.day),
              'is-selected': isSelectedDate(data.day),
              'is-prev-month': data.type === 'prev',
              'is-next-month': data.type === 'next'
            }"
            @click="selectDate(data.day)"
          >
            <div class="date-content">
              <span class="date-number">{{ data.day.split('-')[2] }}</span>
              <div v-if="hasTodosOnDate(data.day)" class="todo-badge">
                {{ getTodoCountOnDate(data.day) }}个待办
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  todos: {
    type: Array,
    required: true
  },
  filter: {
    type: String,
    default: 'all'
  },
  dateFilter: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['toggle-todo', 'delete-todo', 'update:filter', 'update:dateFilter'])

// 视图模式
const viewMode = ref('list')
const currentDate = ref(new Date())
const selectedDate = ref(null)

// 过滤器配置
const filters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' }
]

const dateFilters = [
  { value: 'all', label: '所有日期' },
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'future', label: '未来' },
  { value: 'nodate', label: '无日期' }
]

// 日历相关方法
const formatCalendarTitle = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long'
  })
}

const hasTodosOnDate = (date) => {
  return props.todos.some(todo => todo.date === date)
}

const getTodoCountOnDate = (date) => {
  return props.todos.filter(todo => todo.date === date).length
}

const isSelectedDate = (date) => {
  return selectedDate.value === date
}

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const selectDate = (date) => {
  // 先更新选中状态
  if (selectedDate.value === date) {
    selectedDate.value = null
    emit('update:dateFilter', 'all')
  } else {
    selectedDate.value = date
    emit('update:dateFilter', 'selected')
  }
  
  // 切换到列表视图并重置分页
  viewMode.value = 'list'
  currentPage.value = 1
}

// 统计数据
const stats = computed(() => {
  const totalCount = props.todos.length
  const completedCount = props.todos.filter(t => t.completed).length
  return {
    totalCount,
    completedCount,
    pendingCount: totalCount - completedCount
  }
})

// 日期格式化
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}

// 过滤后的待办事项
const filteredTodos = computed(() => {
  let filtered = props.todos

  // 状态过滤
  if (props.filter === 'active') {
    filtered = filtered.filter(t => !t.completed)
  } else if (props.filter === 'completed') {
    filtered = filtered.filter(t => t.completed)
  }

  // 日期过滤
  if (props.dateFilter === 'selected' && selectedDate.value) {
    // 确保使用选中的日期进行过滤
    filtered = filtered.filter(todo => todo.date === selectedDate.value)
  } else {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    if (props.dateFilter === 'today') {
      filtered = filtered.filter(t => t.date === today)
    } else if (props.dateFilter === 'tomorrow') {
      filtered = filtered.filter(t => t.date === tomorrow)
    } else if (props.dateFilter === 'future') {
      filtered = filtered.filter(t => t.date && t.date > tomorrow)
    } else if (props.dateFilter === 'nodate') {
      filtered = filtered.filter(t => !t.date)
    }
  }

  return filtered
})

// 添加分页相关的状态
const currentPage = ref(1)
const pageSize = ref(10)

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 分页后的待办事项
const paginatedTodos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTodos.value.slice(start, end)
})

// 添加监听器，当过滤器改变时重置选中日期
watch(() => props.dateFilter, (newFilter) => {
  if (newFilter !== 'selected') {
    selectedDate.value = null
  }
})

// 添加获取空状态消息的方法
const getEmptyStateMessage = () => {
  // 根据当前过滤条件返回对应的提示信息
  if (selectedDate.value) {
    return `${formatDate(selectedDate.value)}无待办事项`
  }
  
  if (props.dateFilter === 'today') {
    return '今天无待办事项'
  } else if (props.dateFilter === 'tomorrow') {
    return '明天无待办事项'
  } else if (props.dateFilter === 'future') {
    return '未来无待办事项'
  } else if (props.dateFilter === 'nodate') {
    return '无未设置日期的待办事项'
  }

  if (props.filter === 'completed') {
    return '无已完成的待办事项'
  } else if (props.filter === 'active') {
    return '无未完成的待办事项'
  }

  return '暂无待办事项'
}
</script>

<style scoped>
.todo-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-left {
  display: flex;
  gap: 8px;
}

/* 过滤器样式 */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 列表内容样式 */
.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.todo-items {
  padding: 8px 16px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  border-radius: 4px;
  background-color: var(--el-fill-color-blank);
}

.todo-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.todo-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-text {
  flex: 1;
}

.todo-text.completed {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}

/* 分页器样式 */
.pagination {
  position: sticky;
  bottom: 0;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  z-index: 1;
}

/* 日历视图样式 */
.calendar-container {
  flex: 1;
  min-height: 0;
}

:deep(.el-calendar) {
  height: 100%;
  background: none;
  border: none;
}

.calendar-header {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.calendar-cell {
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.date-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;
  margin-bottom: 4px;
}

.todo-badge {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-top: auto;
}

/* 今天的样式 */
.calendar-cell.is-today .date-number {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: bold;
}

/* 有待办事项的样式 */
.calendar-cell.has-todos {
  background-color: var(--el-color-primary-light-9);
}

/* 选中状态的样式 */
.calendar-cell.is-selected {
  background-color: var(--el-color-primary-light-8);
}

/* 上个月和下个月的日期样式 */
.calendar-cell.is-prev-month,
.calendar-cell.is-next-month {
  opacity: 0.5;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    justify-content: center;
    flex-wrap: wrap;
  }

  .header-right {
    display: flex;
    justify-content: center;
  }

  .filter-row {
    justify-content: center;
  }

  .todo-item {
    flex-direction: column;
    gap: 8px;
  }

  .todo-item-right {
    width: 100%;
    justify-content: space-between;
  }
}

.selected-date-info {
  margin-bottom: 16px;
  padding: 8px 16px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  color: var(--el-color-primary);
  font-size: 14px;
}

/* 日历单元格样式优化 */
:deep(.el-calendar-table td) {
  padding: 0;
  height: 100px;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-top: 8px;
}

/* 列表内容样式优化 */
:deep(.el-scrollbar) {
  flex: 1;
}
</style> 