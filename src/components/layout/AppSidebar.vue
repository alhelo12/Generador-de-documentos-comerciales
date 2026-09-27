<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const editor = useEditorStore()
const settings = useSettingsStore()

const navItems = [
  { path: '/', label: 'Inicio', icon: 'M4 10.5 12 4l8 6.5v8.25a1.25 1.25 0 0 1-1.25 1.25h-13.5A1.25 1.25 0 0 1 4 18.75V10.5Z' },
  { path: '/history', label: 'Historial', icon: 'M4 6.75h16M4 12h16M4 17.25h10' },
  { path: '/settings', label: 'Ajustes', icon: 'M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM4.93 4.93l1.42 1.42m11.3-1.42-1.42 1.42M12 2.5v2M12 19.5v2M2.5 12h2m15 0h2m-17.57 7.07 1.42-1.42m11.3 1.42-1.42-1.42' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function createInvoice() {
  editor.newDoc('invoice')
  router.push('/editor')
}
</script>

<template>
  <aside class="app-sidebar" aria-label="Navegación principal">
    <div class="app-brand">
      <span class="app-brand-mark">D</span>
      <span class="app-brand-name">DocGen</span>
      <span class="app-brand-badge">Beta</span>
    </div>

    <button type="button" class="app-create-button" @click="createInvoice">
      <span class="flex h-6 w-6 items-center justify-center rounded-md bg-text text-lg leading-none text-white" aria-hidden="true">+</span>
      <span>Nuevo documento</span>
    </button>

    <p class="app-nav-label">Workspace</p>
    <div class="app-nav-links">
      <router-link v-for="item in navItems.slice(0, 1)" :key="item.path" :to="item.path" :class="['app-nav-link', isActive(item.path) && 'is-active']">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>{{ item.label }}</span>
      </router-link>
      <router-link v-for="item in navItems.slice(1)" :key="item.path" :to="item.path" :class="['app-nav-link', isActive(item.path) && 'is-active']">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>{{ item.label }}</span>
      </router-link>
    </div>

    <div class="mt-auto hidden space-y-3 lg:block">
      <div class="app-sidebar-divider" />
      <div class="flex items-center gap-2.5 px-2">
        <span class="app-sidebar-avatar">{{ (settings.company.name || 'D').trim().charAt(0).toUpperCase() }}</span>
        <span class="min-w-0"><span class="block truncate text-xs font-bold text-text">{{ settings.company.name || 'Mi empresa' }}</span><span class="block text-[10px] text-text-muted">Cuenta local</span></span>
      </div>
      <router-link to="/settings" class="app-sidebar-settings"><span>Configuración</span><span>↗</span></router-link>
    </div>
  </aside>

  <nav class="app-mobile-nav no-print" aria-label="Navegación móvil">
    <router-link v-for="item in navItems" :key="item.path" :to="item.path" :aria-label="item.label" :class="['app-mobile-link', isActive(item.path) && 'is-active']">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <span>{{ item.label }}</span>
    </router-link>
    <button type="button" class="app-mobile-create" aria-label="Nuevo documento" @click="createInvoice"><span aria-hidden="true">+</span></button>
  </nav>
</template>
