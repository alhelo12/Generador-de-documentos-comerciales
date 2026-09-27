<script setup lang="ts">
import { ref, provide } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppToast from '@/components/ui/AppToast.vue'

const toastRef = ref<InstanceType<typeof AppToast> | null>(null)
provide('toast', {
  show: (msg: string, type?: 'success' | 'error' | 'info', duration?: number) => {
    toastRef.value?.show(msg, type, duration)
  }
})
</script>

<template>
  <div class="app-shell min-h-dvh bg-bg text-text">
    <AppSidebar class="no-print" />
    <div class="app-workspace min-w-0">
      <header class="app-topbar no-print">
        <div class="flex min-w-0 items-center gap-3">
          <span class="app-topbar-mark hidden sm:flex" aria-hidden="true">D</span>
          <div class="min-w-0">
            <p class="app-topbar-kicker">Espacio de trabajo</p>
            <p class="truncate text-sm font-bold text-text">Documentos comerciales</p>
          </div>
        </div>
        <div class="app-topbar-tools">
          <label class="app-topbar-search hidden md:flex">
            <span class="sr-only">Buscar en DocGen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" stroke-linecap="round" /></svg>
            <input type="search" placeholder="Buscar documentos" />
            <kbd>⌘ K</kbd>
          </label>
          <router-link to="/settings" class="app-icon-button" aria-label="Abrir ajustes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM4.93 4.93l1.42 1.42m11.3-1.42-1.42 1.42M12 2.5v2M12 19.5v2M2.5 12h2m15 0h2m-17.57 7.07 1.42-1.42m11.3 1.42-1.42-1.42" stroke-linecap="round" /></svg>
          </router-link>
          <span class="app-user-avatar" aria-label="Cuenta de DocGen">D</span>
        </div>
      </header>
      <main class="app-main min-w-0 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <AppToast ref="toastRef" />
  </div>
</template>
