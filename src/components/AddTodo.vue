<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import { PRIORITY_LABELS } from '../types/todo'
import type { Priority } from '../types/todo'

const store = useTodoStore()

interface FormData {
  title: string
  category: string
  priority: Priority
}

const INITIAL_FORM: FormData = {
  title: '',
  category: '',
  priority: 'medium',
}

const form = reactive<FormData>({ ...INITIAL_FORM })

const TITLE_MAX_LENGTH = 100

const categoryOptions = computed(() => store.value.categories)

function handleSubmit() {
  const trimmed = form.title.trim()
  if (!trimmed) return

  store.value.addTodo({
    title: trimmed,
    description: '',
    category: form.category,
    priority: form.priority,
    dueDate: '',
  })

  Object.assign(form, { ...INITIAL_FORM })
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="flex flex-col gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] sm:flex-row sm:items-end"
    novalidate
  >
    <div class="flex flex-1 flex-col gap-1">
      <label for="add-title" class="text-xs font-bold uppercase tracking-wider">任务标题</label>
      <input
        id="add-title"
        v-model="form.title"
        type="text"
        :maxlength="TITLE_MAX_LENGTH"
        placeholder="输入任务内容..."
        class="border-2 border-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      />
    </div>

    <div class="flex flex-col gap-1 sm:w-28">
      <label for="add-category" class="text-xs font-bold uppercase tracking-wider">分类</label>
      <select
        id="add-category"
        v-model="form.category"
        class="cursor-pointer border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      >
        <option value="">未分类</option>
        <option
          v-for="cat in categoryOptions"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="flex flex-col gap-1 sm:w-28">
      <label for="add-priority" class="text-xs font-bold uppercase tracking-wider">优先级</label>
      <select
        id="add-priority"
        v-model="form.priority"
        class="cursor-pointer border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      >
        <option
          v-for="(label, key) in PRIORITY_LABELS"
          :key="key"
          :value="key"
        >
          {{ label }}
        </option>
      </select>
    </div>

    <button
      type="submit"
      class="border-2 border-black bg-black px-6 py-2 text-sm font-extrabold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-gray-800 hover:shadow-none"
    >
      添加
    </button>
  </form>
</template>