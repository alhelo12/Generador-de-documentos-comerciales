<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppToast from '@/components/ui/AppToast.vue'
import gsap from 'gsap'

const toastRef = ref<InstanceType<typeof AppToast> | null>(null)
provide('toast', {
  show: (msg: string, type?: 'success' | 'error' | 'info', duration?: number) => {
    toastRef.value?.show(msg, type, duration)
  }
})

onMounted(() => {
  gsap.fromTo('.ambient-orb-1', { x: -200, y: -200 }, { x: 100, y: 80, duration: 20, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  gsap.fromTo('.ambient-orb-2', { x: 200, y: 200 }, { x: -80, y: -60, duration: 25, repeat: -1, yoyo: true, ease: 'sine.inOut' })
})
</script>

<template>
  <div class="app-shell grain min-h-dvh md:h-screen flex flex-col md:flex-row overflow-hidden relative">
    <div class="ambient-orb ambient-orb-1 w-[500px] h-[500px] bg-accent/10 top-[-10%] left-[-5%] fixed" />
    <div class="ambient-orb ambient-orb-2 w-[400px] h-[400px] bg-purple/10 bottom-[-10%] right-[-5%] fixed" />
    <AppSidebar class="no-print" />
    <main class="app-main glass-pressed min-w-0 flex-1 overflow-hidden rounded-none md:rounded-2xl relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppToast ref="toastRef" />
  </div>
</template>
