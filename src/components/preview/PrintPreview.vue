<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import type { DocumentData, SectionConfig } from '@/types/document'
import DocumentClassic from '@/components/documents/DocumentClassic.vue'
import DocumentModern from '@/components/documents/DocumentModern.vue'
import DocumentMinimal from '@/components/documents/DocumentMinimal.vue'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const frame = useTemplateRef<HTMLElement>('frame')
let resizeObserver: ResizeObserver | undefined

const pageSize = computed(() => props.doc.paperSize === 'a4'
  ? { width: 794, height: 1123 }
  : { width: 816, height: 1056 })

function updateScale() {
  const element = frame.value
  if (!element) return
  const scale = Math.min(1, element.clientWidth / pageSize.value.width)
  element.style.setProperty('--preview-scale', String(scale))
}

onMounted(() => {
  updateScale()
  resizeObserver = new ResizeObserver(updateScale)
  if (frame.value) resizeObserver.observe(frame.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div ref="frame" class="preview-shell" :style="{ aspectRatio: `${pageSize.width} / ${pageSize.height}` }">
    <div class="preview-content">
      <div class="preview-document" :style="{ width: `${pageSize.width}px`, height: `${pageSize.height}px` }">
        <DocumentClassic v-if="doc.style === 'classic'" :doc="doc" :sections="sections" />
        <DocumentModern v-else-if="doc.style === 'modern'" :doc="doc" :sections="sections" />
        <DocumentMinimal v-else :doc="doc" :sections="sections" />
      </div>
    </div>
  </div>
</template>
