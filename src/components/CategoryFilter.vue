<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()

const allCategories = computed(() => [
  { id: 'all', name: '全部任务', color: '#000' },
  ...store.categories,
])

const activeId = computed(() => store.filter.category)

function selectCategory(id: string) {
  store.setFilter({ category: id })
}

const isAdding = ref(false)
const newName = ref('')
const newColor = ref('#FF6B35')

const PRESET_COLORS = [
  '#FF6B35',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
]

function startAdd() {
  isAdding.value = true
  newName.value = ''
}

function cancelAdd() {
  isAdding.value = false
  newName.value = ''
}

function confirmAdd() {
  const trimmed = newName.value.trim()
  if (!trimmed) return
  store.addCategory({
    name: trimmed,
    color: newColor.value,
  })
  isAdding.value = false
  newName.value = ''
}

function deleteCategory(id: string, event: Event) {
  event.stopPropagation()
  store.deleteCategory(id)
}
</script>

<template>
  <div class="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-500">分类筛选</h3>
      <button
        v-if="!isAdding"
        class="text-xs font-bold text-gray-400 hover:text-black"
        @click="startAdd"
      >
        + 新建
      </button>
    </div>

    <div v-if="isAdding" class="mb-4 flex flex-col gap-2 border-2 border-black p-3">
      <input
        v-model="newName"
        type="text"
        placeholder="分类名称"
        class="border-2 border-black px-2 py-1.5 text-sm outline-none"
        @keyup.enter="confirmAdd"
      />
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="color in PRESET_COLORS"
          :key="color"
          class="h-5 w-5 border-2"
          :class="newColor === color ? 'border-black' : 'border-transparent'"
          :style="{ backgroundColor: color }"
          @click="newColor = color"
        />
      </div>
      <div class="flex gap-2">
        <button
          class="border-2 border-black bg-black px-3 py-1 text-xs font-bold text-white"
          @click="confirmAdd"
        >
          确认
        </button>
        <button
          class="border-2 border-gray-200 px-3 py-1 text-xs font-bold text-gray-500"
          @click="cancelAdd"
        >
          取消
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <button
        v-for="cat in allCategories"
        :key="cat.id"
        class="group flex items-center gap-3 border-2 px-4 py-2.5 text-left text-sm font-bold transition-all"
        :class="
          activeId === cat.id
            ? 'border-black bg-black text-white'
            : 'border-gray-200 bg-white text-black hover:border-black'
        "
        @click="selectCategory(cat.id)"
      >
        <span
          class="inline-block h-3 w-3 border"
          :class="activeId === cat.id ? 'border-white' : 'border-black'"
          :style="{ backgroundColor: cat.color }"
        />
        <span class="flex-1">{{ cat.name }}</span>
        <button
          v-if="cat.id !== 'all'"
          class="opacity-0 text-xs text-gray-400 hover:text-red-500 group-hover:opacity-100"
          @click="deleteCategory(cat.id, $event)"
        >
          ✕
        </button>
      </button>
    </div>
  </div>
</template>