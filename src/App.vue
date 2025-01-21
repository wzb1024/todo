<template>
  <div>
    <!-- 自定义标题栏 -->
    <div class="titlebar">
      <div class="titlebar-drag">TODO</div>
      <div class="titlebar-buttons">
        <button @click="minimizeWindow" class="titlebar-button">─</button>
        <button @click="maximizeWindow" class="titlebar-button">□</button>
        <button @click="closeWindow" class="titlebar-button">×</button>
      </div>
    </div>

    <div class="container">
      <div class="row g-3">
        <!-- 输入区域 -->
        <div class="col-md-4">
          <TodoInput @add-todo="addTodo" />
        </div>
        
        <!-- 待办列表区域 -->
        <div class="col-md-8">
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
import { ref, computed, onMounted } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'

const todos = ref([])
const currentFilter = ref('all')
const currentDateFilter = ref('all')

// Window control methods
const minimizeWindow = () => window.electron.minimizeWindow()
const maximizeWindow = () => window.electron.maximizeWindow()
const closeWindow = () => window.electron.closeWindow()

// Todo methods
const addTodo = (todo) => {
  todos.value.push({
    id: Date.now(),
    text: todo.text,
    date: todo.date,
    completed: false
  })
  saveTodos()
}

const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
  }
}

const deleteTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
  saveTodos()
}

// Filter computed properties
const filteredTodos = computed(() => {
  let filtered = todos.value

  // Status filter
  if (currentFilter.value === 'active') {
    filtered = filtered.filter(todo => !todo.completed)
  } else if (currentFilter.value === 'completed') {
    filtered = filtered.filter(todo => todo.completed)
  }

  // Date filter
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  if (currentDateFilter.value === 'today') {
    filtered = filtered.filter(todo => todo.date === today)
  } else if (currentDateFilter.value === 'tomorrow') {
    filtered = filtered.filter(todo => todo.date === tomorrow)
  } else if (currentDateFilter.value === 'future') {
    filtered = filtered.filter(todo => todo.date > tomorrow)
  } else if (currentDateFilter.value === 'nodate') {
    filtered = filtered.filter(todo => !todo.date)
  }

  return filtered
})

// Local storage
const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos.value))
}

onMounted(() => {
  const savedTodos = localStorage.getItem('todos')
  if (savedTodos) {
    todos.value = JSON.parse(savedTodos)
  }
})
</script>

<style scoped>
/* Your existing styles can be moved to assets/styles.css */
</style> 