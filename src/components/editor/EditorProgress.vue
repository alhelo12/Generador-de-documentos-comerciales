<script setup lang="ts">
import { editorSteps, type EditorStep } from './editorFlow'

const props = defineProps<{ current: EditorStep; completed: EditorStep[] }>()
const emit = defineEmits<{ select: [step: EditorStep] }>()

function isAvailable(step: EditorStep) {
  return props.completed.includes(step) || step === props.current || editorSteps.findIndex((item) => item.id === step) < editorSteps.findIndex((item) => item.id === props.current)
}
</script>

<template>
  <nav class="editor-progress" aria-label="Progreso del documento">
    <ol class="flex items-center gap-1">
      <li v-for="(step, index) in editorSteps" :key="step.id" class="flex min-w-0 flex-1 items-center gap-1">
        <button
          type="button"
          :disabled="!isAvailable(step.id)"
          :aria-current="props.current === step.id ? 'step' : undefined"
          :class="['flex min-w-0 flex-1 items-center gap-2 rounded-[12px] px-2 py-2 text-left transition-colors disabled:cursor-default', props.current === step.id ? 'bg-text text-white' : isAvailable(step.id) ? 'bg-white text-text hover:bg-surface-hover' : 'text-text-muted']"
          @click="isAvailable(step.id) && emit('select', step.id)"
        >
          <span :class="['flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold', props.current === step.id ? 'bg-accent text-accent-text' : props.completed.includes(step.id) ? 'bg-accent text-accent-text' : 'bg-surface-hover text-text-muted']">
            {{ props.completed.includes(step.id) ? '✓' : index + 1 }}
          </span>
          <span class="hidden min-w-0 truncate text-[11px] font-bold sm:block">{{ step.label }}</span>
          <span class="min-w-0 truncate text-[11px] font-bold sm:hidden">{{ step.shortLabel }}</span>
        </button>
        <span v-if="index < editorSteps.length - 1" class="hidden h-px w-2 shrink-0 bg-border sm:block" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>
