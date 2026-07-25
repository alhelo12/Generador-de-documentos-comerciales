<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import gsap from 'gsap'

const route = useRoute()
const settings = useSettingsStore()
const hoveredItem = ref<string | null>(null)

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { path: '/editor', label: 'Documentos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/history', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/settings', label: 'Configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function onNavHover(el: HTMLElement) {
  gsap.to(el, { scale: 1.02, duration: 0.25, ease: 'power3.out' })
}
function onNavLeave(el: HTMLElement) {
  gsap.to(el, { scale: 1, duration: 0.2, ease: 'power2.out' })
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.fromTo('.sidebar-shell', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' })
})
</script>

<template>
  <aside class="sidebar-shell fixed inset-x-3 bottom-3 z-40 glass-raised rounded-2xl flex flex-col shrink-0 no-print md:static md:w-[260px] md:h-full md:rounded-2xl md:inset-auto md:bottom-auto md:left-auto md:top-auto">
    <!-- Logo -->
    <div class="hidden px-5 py-6 md:flex items-center gap-3.5">
      <div class="w-10 h-10 rounded-xl accent-glow flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <div>
        <span class="text-sm font-bold tracking-tight text-text block leading-tight">DocGen</span>
        <span class="text-[10px] text-text-muted font-medium tracking-wide uppercase">Generador de documentos</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex flex-1 gap-1 p-2 md:block md:px-3 md:space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @mouseenter="onNavHover($event.currentTarget as HTMLElement)"
        @mouseleave="onNavLeave($event.currentTarget as HTMLElement)"
        :class="[
          'group flex flex-1 items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 md:justify-start',
          isActive(item.path)
             ? 'bg-accent/15 text-accent shadow-[0_0_20px_rgba(75,110,245,0.1)]'
            : 'text-text-secondary hover:text-text hover:bg-black/[0.04]',
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" :class="isActive(item.path) ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'"><path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" /></svg>
        <span class="hidden sm:inline">{{ item.label }}</span>
        <span class="sm:hidden text-[10px] leading-none">{{ item.path === '/' ? 'Inicio' : item.path === '/editor' ? 'Crear' : item.path === '/history' ? 'Historial' : 'Ajustes' }}</span>
        <div v-if="isActive(item.path)" class="absolute left-0 w-[3px] h-5 bg-accent rounded-r-full hidden md:block" />
      </router-link>
    </nav>

    <!-- Company card -->
    <div class="hidden px-3 pb-3 md:block">
      <div class="glass-pressed px-3.5 py-3 rounded-xl">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span class="text-xs font-semibold truncate text-text">{{ settings.company.name || 'Mi Empresa' }}</span>
        </div>
        <p class="text-[10px] truncate text-text-muted font-medium">RFC: {{ settings.company.rfc || 'XXXXXXXXXXXX' }}</p>
      </div>
    </div>

    <!-- Settings -->
    <div class="hidden px-3 pb-4 md:block">
      <router-link to="/settings" class="glass-control flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Configuracion
      </router-link>
    </div>
  </aside>
</template>
