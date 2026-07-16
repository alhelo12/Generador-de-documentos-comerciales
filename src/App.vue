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
  <div class="min-h-dvh md:h-screen flex flex-col md:flex-row gap-3 bg-bg text-text overflow-hidden p-3 pb-24 md:pb-3 print:bg-white print:p-0">
    <AppSidebar class="no-print" />
    <main class="neu-pressed min-w-0 flex-1 overflow-hidden rounded-3xl">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppToast ref="toastRef" />
  </div>
</template>
