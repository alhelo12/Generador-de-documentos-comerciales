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
  <div class="app-shell min-h-dvh md:h-screen flex flex-col overflow-hidden relative bg-bg text-text">
    <AppSidebar class="no-print" />
    <main class="app-main min-w-0 flex-1 overflow-hidden bg-bg relative z-10 pb-24 md:pb-24">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppToast ref="toastRef" />
  </div>
</template>
