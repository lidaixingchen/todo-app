<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import type { SortField, SortOrder } from '../types/todo'
import TodoItem from './TodoItem.vue'

const store = useTodoStore()

const filteredTodos = computed(() => store.value.getFilteredTodos())

const search = computed({
  get: () => store.value.filter.search,
  set: (val: string) => store.value.setFilter({ search: val }),
})

const sortField = computed({
  get: () => store.value.sortConfig.field,
  set: (val: SortField) => store.value.setSortConfig({ field: val }),
})

const sortOrder = computed({
  get: () => store.value.sortConfig.order,
  set: (val: SortOrder) => store.value.setSortConfig({ order: val }),
})

function toggleOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const SORT_LABELS: Record<SortField, string> = {
  createdAt: '创建时间',
  dueDate: '截止日期',
  priority: '优先级',
  title: '标题',
}

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '待办' },
  { key: 'completed', label: '已完成' },
] as const

const activeStatus = computed({
  get: () => store.value.filter.status,
  set: (val: 'all' | 'active' | 'completed') => store.value.setFilter({ status: val }),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000]">
      <h3 class="text-base font-extrabold uppercase tracking-wide">今日任务</h3>

      <div class="flex items-center gap-3">
        <div class="flex gap-1">
          <button
            v-for="tab in statusTabs"
            :key="tab.key"
            class="border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider"
            :class="
              activeStatus === tab.key
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black'
            "
            @click="activeStatus = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <input
          v-model="search"
          type="text"
          placeholder="搜索任务..."
          class="w-40 border-2 border-black px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-black"
        />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-gray-500">排序</span>
      <select
        v-model="sortField"
        class="cursor-pointer border-2 border-black bg-white px-2 py-1 text-xs outline-none"
      >
        <option
          v-for="(label, key) in SORT_LABELS"
          :key="key"
          :value="key"
        >
          {{ label }}
        </option>
      </select>
      <button
        class="border-2 border-black px-2 py-1 text-xs font-bold"
        @click="toggleOrder"
      >
        {{ sortOrder === 'asc' ? '↑' : '↓' }}
      </button>
    </div>

    <div v-if="filteredTodos.length === 0" class="py-12 text-center text-sm text-gray-400">
      暂无任务
    </div>

    <div v-else class="flex flex-col gap-2">
      <TodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
      />
    </div>
  </div>
</template>