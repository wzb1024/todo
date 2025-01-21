<template>
  <div class="card">
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="todo-input-group">
          <textarea
            v-model="todoText"
            class="form-control"
            placeholder="添加新的待办事项..."
            required
          ></textarea>
          <div class="d-flex gap-2">
            <input
              ref="datePicker"
              type="text"
              class="form-control"
              placeholder="选择日期"
            >
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import flatpickr from 'flatpickr'

const emit = defineEmits(['add-todo'])
const todoText = ref('')
const datePicker = ref(null)
let fp = null

onMounted(() => {
  fp = flatpickr(datePicker.value, {
    dateFormat: 'Y-m-d',
    minDate: 'today'
  })
})

const handleSubmit = () => {
  if (todoText.value.trim()) {
    emit('add-todo', {
      text: todoText.value,
      date: fp.selectedDates[0] ? fp.selectedDates[0].toISOString().split('T')[0] : null
    })
    todoText.value = ''
    fp.clear()
  }
}
</script> 