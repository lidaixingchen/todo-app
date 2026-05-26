<script setup lang="ts">
import { onMounted } from 'vue'
import { useTodoStore } from './stores/todoStore'
import StatsPanel from './components/StatsPanel.vue'
import CategoryFilter from './components/CategoryFilter.vue'
import AddTodo from './components/AddTodo.vue'
import TaskList from './components/TaskList.vue'

const store = useTodoStore()

onMounted(() => {
  store.loadFromStorage()
})
</script>

<template>
  <div class="min-h-screen bg-[#F5F0E8] px-4 py-8">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-black uppercase tracking-widest text-black">
          我的待办清单
        </h1>
        <p class="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
          Todo List · 高效管理每日任务
        </p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside class="flex flex-col gap-6">
          <StatsPanel />
          <CategoryFilter />
        </aside>

        <main class="flex flex-col gap-6">
          <AddTodo />
          <TaskList />
        </main>
      </div>
    </div>
  </div>
</template>