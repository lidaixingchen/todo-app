<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()

const allCategories = computed(() => [
  { id: 'all', name: '全部任务', color: '#000' },
  ...store.value.categories,
])

const activeId = computed(() => store.value.filter.category)

function selectCategory(id: string) {
  store.value.setFilter({ category: id })
}
</script>

<template>
  <div class="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]">
    <h3 class="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">分类筛选</h3>

    <div class="flex flex-col gap-2">
      <button
        v-for="cat in allCategories"
        :key="cat.id"
        class="flex items-center gap-3 border-2 px-4 py-2.5 text-left text-sm font-bold transition-all"
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
        {{ cat.name }}
      </button>
    </div>
  </div>
</template>