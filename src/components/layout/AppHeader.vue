<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { useEditorStore } from '@/stores/editor'

const router = useRouter()
const route = useRoute()
const editor = useEditorStore()
const showNewMenu = ref(false)

function newDoc(type: 'invoice' | 'delivery-note' | 'quote') {
  showNewMenu.value = false
  editor.newDoc(type)
  router.push('/editor')
}

function closeMenu() { showNewMenu.value = false }

const labels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }
</script>

<template>
  <header class="h-16 border-b border-neutral-200 bg-white flex items-center px-4 lg:px-6 select-none">
    <div class="flex items-center gap-3 mr-8 cursor-pointer" @click="router.push('/')">
      <img src="/favicon.svg" alt="" class="w-7 h-7" />
      <span class="text-lg font-semibold tracking-tight">DocGen</span>
    </div>

    <div class="relative">
      <AppButton @click="showNewMenu = !showNewMenu" size="md" aria-label="Crear nuevo documento">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        </template>
        Nuevo
      </AppButton>
      <Transition name="page">
        <div v-if="showNewMenu" class="absolute top-full mt-1 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[180px] z-10" @click.self @keydown.escape="closeMenu" role="menu">
          <button v-for="(label, type) in labels" :key="type" @click="newDoc(type as any)" class="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 transition-colors" role="menuitem">
            {{ label }}
          </button>
        </div>
      </Transition>
    </div>

    <nav class="ml-8 flex gap-1">
      <AppButton variant="ghost" size="sm" :class="route.path === '/' && 'bg-neutral-100 text-neutral-950'" @click="router.push('/')">Inicio</AppButton>
      <AppButton variant="ghost" size="sm" :class="route.path === '/history' && 'bg-neutral-100 text-neutral-950'" @click="router.push('/history')">Historial</AppButton>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <AppButton variant="ghost" size="md" @click="router.push('/settings')" aria-label="Configuración">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </template>
        Ajustes
      </AppButton>
    </div>
  </header>
</template>
