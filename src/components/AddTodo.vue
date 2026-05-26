<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
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

const catOpen = ref(false)
const priOpen = ref(false)

const selectedCatName = computed(() => {
  if (!form.category) return '未分类'
  const cat = categoryOptions.value.find((c) => c.id === form.category)
  return cat?.name ?? '未分类'
})

const selectedPriLabel = computed(() => PRIORITY_LABELS[form.priority])

function selectCat(id: string) {
  form.category = id
  catOpen.value = false
}

function selectPri(key: Priority) {
  form.priority = key
  priOpen.value = false
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

    <div class="relative flex flex-col gap-1 sm:w-32">
      <span class="text-xs font-bold uppercase tracking-wider">分类</span>
      <button
        type="button"
        class="flex items-center justify-between border-2 border-black bg-white px-3 py-2 text-sm"
        @click="catOpen = !catOpen"
      >
        <span>{{ selectedCatName }}</span>
        <span class="text-xs">▼</span>
      </button>
      <div
        v-if="catOpen"
        class="absolute top-full z-10 mt-1 w-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
      >
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          :class="form.category === '' ? 'bg-gray-100 font-bold' : ''"
          @click="selectCat('')"
        >
          未分类
        </button>
        <button
          v-for="cat in categoryOptions"
          :key="cat.id"
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          :class="form.category === cat.id ? 'bg-gray-100 font-bold' : ''"
          @click="selectCat(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div class="relative flex flex-col gap-1 sm:w-28">
      <span class="text-xs font-bold uppercase tracking-wider">优先级</span>
      <button
        type="button"
        class="flex items-center justify-between border-2 border-black bg-white px-3 py-2 text-sm"
        @click="priOpen = !priOpen"
      >
        <span>{{ selectedPriLabel }}</span>
        <span class="text-xs">▼</span>
      </button>
      <div
        v-if="priOpen"
        class="absolute top-full z-10 mt-1 w-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
      >
        <button
          v-for="(label, key) in PRIORITY_LABELS"
          :key="key"
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          :class="form.priority === key ? 'bg-gray-100 font-bold' : ''"
          @click="selectPri(key as Priority)"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <button
      type="submit"
      class="border-2 border-black bg-black px-6 py-2 text-sm font-extrabold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-gray-800 hover:shadow-none"
    >
      添加
    </button>
  </form>
</template>