<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settings = useSettingsStore()

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { path: '/editor', label: 'Documentos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/history', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/settings', label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="neu-raised fixed inset-x-3 bottom-3 z-40 h-auto rounded-2xl flex flex-col shrink-0 no-print md:static md:w-60 md:h-full md:rounded-3xl">
    <!-- Logo -->
    <div class="hidden px-5 py-5 md:flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent shadow-[4px_4px_9px_#c0c8d4,-4px_-4px_9px_#fff]">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <span class="text-base font-bold tracking-tight text-text">DocGen</span>
    </div>

    <!-- Nav -->
    <nav class="flex flex-1 gap-1 p-2 md:block md:px-3 md:space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-1 items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-[box-shadow,color,transform] md:justify-start',
          isActive(item.path) ? 'bg-surface-active text-accent shadow-[inset_3px_3px_7px_#c7cfda,inset_-3px_-3px_7px_#fff]' : 'text-text-secondary hover:text-text hover:shadow-[4px_4px_9px_#c2cad6,-4px_-4px_9px_#fff]',
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" /></svg>
        <span class="hidden sm:inline">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Company card -->
    <div class="hidden px-3 pb-3 md:block">
      <div class="neu-pressed px-3 py-3 rounded-2xl">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 rounded-full bg-success" />
          <span class="text-xs font-semibold truncate text-text">{{ settings.company.name || 'Mi Empresa' }}</span>
        </div>
        <p class="text-[11px] truncate" style="color: #94a3b8;">RFC: {{ settings.company.rfc || 'XXXXXXXXXXXX' }}</p>
      </div>
    </div>

    <!-- Settings -->
    <div class="hidden px-3 pb-4 md:block">
      <router-link to="/settings" class="neu-control flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Configuración
      </router-link>
    </div>
  </aside>
</template>
