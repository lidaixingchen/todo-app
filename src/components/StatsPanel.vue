<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const storeRef = useTodoStore()
const store = computed(() => storeRef.value)

const completionRate = computed(() => {
  if (store.value.stats.total === 0) return 0
  return Math.round((store.value.stats.completed / store.value.stats.total) * 100)
})
</script>

<template>
  <div class="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]">
    <h3 class="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">统计数据</h3>

    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between border-b border-gray-200 pb-2">
        <span class="text-sm font-medium">总任务</span>
        <span class="text-lg font-black">{{ store.stats.total }}</span>
      </div>

      <div class="flex items-center justify-between border-b border-gray-200 pb-2">
        <span class="text-sm font-medium">待完成</span>
        <span class="text-lg font-black text-[#FF6B35]">{{ store.stats.pending }}</span>
      </div>

      <div class="flex items-center justify-between border-b border-gray-200 pb-2">
        <span class="text-sm font-medium">已完成</span>
        <span class="text-lg font-black text-green-600">{{ store.stats.completed }}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">完成率</span>
        <span class="text-lg font-black">{{ completionRate }}%</span>
      </div>
    </div>
  </div>
</template>