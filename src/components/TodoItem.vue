<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import { PRIORITY_LABELS } from '../types/todo'
import type { Todo } from '../types/todo'

const props = defineProps<{
  todo: Todo
}>()

const store = useTodoStore()

const category = computed(() =>
  store.categories.find((c) => c.id === props.todo.category)
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
  store.toggleTodo(props.todo.id)
}

function remove() {
  store.deleteTodo(props.todo.id)
}

const formattedDate = computed(() => {
  if (!props.todo.dueDate) return ''
  return props.todo.dueDate
})

const subtasks = computed(() => store.getSubtasks(props.todo.id))

const showSubtasks = ref(false)
const addingSub = ref(false)
const subTitle = ref('')

function addSubtask() {
  const trimmed = subTitle.value.trim()
  if (!trimmed) return
  store.addTodo({
    title: trimmed,
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    parentId: props.todo.id,
  })
  subTitle.value = ''
  addingSub.value = false
  showSubtasks.value = true
}

function toggleSub(id: string) {
  store.toggleTodo(id)
}

function deleteSub(id: string) {
  store.deleteTodo(id)
}
</script>

<template>
  <div
    class="flex flex-col border-2 border-gray-200 bg-white transition-all hover:border-black"
    :class="{ 'opacity-60': todo.completed }"
  >
    <div class="flex items-start gap-3 p-4">
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

      <div class="flex flex-col items-end gap-1">
        <button
          class="border-2 border-gray-200 px-2 py-1 text-xs font-bold text-gray-400 hover:border-red-500 hover:text-red-500"
          @click="remove"
        >
          删除
        </button>
        <button
          class="border-2 border-gray-200 px-2 py-1 text-xs font-bold text-gray-400 hover:border-black hover:text-black"
          @click="showSubtasks = !showSubtasks"
        >
          子任务 {{ subtasks.length > 0 ? `(${subtasks.length})` : '' }}
        </button>
      </div>
    </div>

    <div v-if="showSubtasks" class="border-t-2 border-gray-100 bg-gray-50 px-4 py-3">
      <div v-if="subtasks.length > 0" class="mb-3 flex flex-col gap-2">
        <div
          v-for="sub in subtasks"
          :key="sub.id"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            :checked="sub.completed"
            class="h-3.5 w-3.5 cursor-pointer border-2 border-black accent-black"
            @change="toggleSub(sub.id)"
          />
          <span
            class="flex-1 text-sm"
            :class="{ 'line-through': sub.completed }"
          >
            {{ sub.title }}
          </span>
          <button
            class="text-xs text-gray-400 hover:text-red-500"
            @click="deleteSub(sub.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-if="addingSub" class="flex gap-2">
        <input
          v-model="subTitle"
          type="text"
          placeholder="输入子任务标题"
          class="flex-1 border-2 border-black px-2 py-1 text-sm outline-none"
          @keyup.enter="addSubtask"
        />
        <button
          class="border-2 border-black bg-black px-3 py-1 text-xs font-bold text-white"
          @click="addSubtask"
        >
          添加
        </button>
        <button
          class="border-2 border-gray-200 px-3 py-1 text-xs font-bold text-gray-500"
          @click="addingSub = false"
        >
          取消
        </button>
      </div>

      <button
        v-else
        class="text-xs font-bold text-gray-500 hover:text-black"
        @click="addingSub = true"
      >
        + 添加子任务
      </button>
    </div>
  </div>
</template>