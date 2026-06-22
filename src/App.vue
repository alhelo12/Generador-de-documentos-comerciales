<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppStatusBar from '@/components/layout/AppStatusBar.vue'
import AppToast from '@/components/ui/AppToast.vue'
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-950 flex flex-col print:bg-white">
    <AppHeader class="no-print" />
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppStatusBar class="no-print" />
    <AppToast />
  </div>
</template>
