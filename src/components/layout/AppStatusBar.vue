<script setup lang="ts">
import { computed } from 'vue'
import { useDocumentsStore } from '@/stores/documents'

const docs = useDocumentsStore()
const today = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return docs.docs.filter(d => d.createdAt === todayStr).length
})
</script>

<template>
  <footer class="h-8 border-t border-neutral-200 bg-white flex items-center px-4 lg:px-6 text-[11px] text-neutral-400 select-none">
    <span>{{ docs.stats.total }} documentos · {{ today }} hoy</span>
    <span class="ml-auto">DocGen v1.0</span>
  </footer>
</template>
