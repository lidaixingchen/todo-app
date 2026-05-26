<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import { PRIORITY_LABELS } from '../types/todo'
import type { Todo } from '../types/todo'

const props = defineProps<{
  todo: Todo
}>()

const store = useTodoStore()

const category = computed(() =>
  store.value.categories.find((c) => c.id === props.todo.category)
)

const priorityClass = computed(() => {
  switch (props.todo.priority) {
    case 'high':
      return 'bg-red-500 text-white'
    case 'medium':
      return 'bg-yellow-400 text-black'
    default:
      return 'bg-green-500 text-white'
  }
})

function toggle() {
  store.value.toggleTodo(props.todo.id)
}

function remove() {
  store.value.deleteTodo(props.todo.id)
}

const formattedDate = computed(() => {
  if (!props.todo.dueDate) return ''
  return props.todo.dueDate
})
</script>

<template>
  <div
    class="flex items-start gap-3 border-2 border-gray-200 bg-white p-4 transition-all hover:border-black"
    :class="{ 'opacity-60': todo.completed }"
  >
    <input
      type="checkbox"
      :checked="todo.completed"
      class="mt-1 h-4 w-4 cursor-pointer border-2 border-black accent-black"
      @change="toggle"
    />

    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-center gap-2">
        <span
          class="text-base font-bold"
          :class="{ 'line-through': todo.completed }"
        >
          {{ todo.title }}
        </span>
      </div>

      <p v-if="todo.description" class="text-xs text-gray-500">
        {{ todo.description }}
      </p>

      <div class="mt-1 flex items-center gap-2">
        <span
          v-if="category"
          class="border px-2 py-0.5 text-xs font-bold"
          :style="{ borderColor: category.color, color: category.color }"
        >
          {{ category.name }}
        </span>

        <span
          class="px-2 py-0.5 text-xs font-bold"
          :class="priorityClass"
        >
          {{ PRIORITY_LABELS[todo.priority] }}
        </span>

        <span v-if="formattedDate" class="text-xs text-gray-400">
          {{ formattedDate }}
        </span>
      </div>
    </div>

    <button
      class="border-2 border-gray-200 px-2 py-1 text-xs font-bold text-gray-400 hover:border-red-500 hover:text-red-500"
      @click="remove"
    >
      删除
    </button>
  </div>
</template>