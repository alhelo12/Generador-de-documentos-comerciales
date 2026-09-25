<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { path: '/editor', label: 'Crear', icon: 'M12 4v16m8-8H4' },
  { path: '/history', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/settings', label: 'Ajustes', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-stretch gap-1 rounded-[24px] bg-white/90 backdrop-blur-md border border-white px-2 py-1.5" style="box-shadow: 0 12px 32px rgba(20,20,20,0.16);">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      :aria-label="item.label"
      :title="item.label"
      :class="[
        'min-w-[62px] px-3 py-1.5 rounded-[18px] flex flex-col items-center gap-0.5 transition-all',
        isActive(item.path)
          ? 'bg-text text-white'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text',
      ]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" /></svg>
      <span class="text-[9px] font-bold leading-none">{{ item.label }}</span>
    </router-link>
  </nav>
</template>
