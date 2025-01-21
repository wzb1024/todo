<template>
  <div class="card">
    <div class="card-header p-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="btn-group">
          <button
            v-for="f in filters"
            :key="f.value"
            :class="['btn btn-outline-primary', { active: filter === f.value }]"
            @click="$emit('update:filter', f.value)"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="btn-group">
          <button
            v-for="f in dateFilters"
            :key="f.value"
            :class="['btn btn-outline-secondary', { active: dateFilter === f.value }]"
            @click="$emit('update:dateFilter', f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="card-body p-0">
      <div class="todo-list">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item"
          :class="{ completed: todo.completed }"
        >
          <div class="todo-content">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="$emit('toggle-todo', todo.id)"
              class="form-check-input"
            >
            <div class="todo-text">{{ todo.text }}</div>
            <div v-if="todo.date" class="todo-date">{{ formatDate(todo.date) }}</div>
          </div>
          <button
            class="btn btn-sm btn-danger"
            @click="$emit('delete-todo', todo.id)"
          >
            删除
          </button>
        </div>
        <div v-if="!todos.length" class="no-todos">
          暂无待办事项
        </div>
      </div>
    </div>

    <div class="card-footer py-2">
      <div class="d-flex justify-content-between align-items-center">
        <div class="statistics">
          总计: {{ totalCount }} |
          已完成: {{ completedCount }} |
          待完成: {{ pendingCount }}
        </div>
        <div class="text-secondary">共 {{ totalCount }} 项</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

defineEmits(['toggle-todo', 'delete-todo', 'update:filter', 'update:dateFilter'])

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

const totalCount = computed(() => props.todos.length)
const completedCount = computed(() => props.todos.filter(t => t.completed).length)
const pendingCount = computed(() => totalCount.value - completedCount.value)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-text {
  flex: 1;
}

.todo-date {
  color: #666;
  font-size: 0.9em;
}

.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.no-todos {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style> 